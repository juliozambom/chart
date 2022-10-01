import {
  Canvas,
  Line,
  Skia,
  vec,
  Path,
  LinearGradient,
  useValue,
  runTiming,
  Easing,
  useComputedValue,
} from "@shopify/react-native-skia";
import * as Gradient from "expo-linear-gradient";
import { line, scaleLinear, curveBumpX } from "d3";
import { useState } from "react";
import {
  StatusBar,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";

import { _2021, _2022 } from "./Data";

export default function App() {
  const [currentYear, setCurrentYear] = useState(2021);
  const [currentMonth, setCurrentMonth] = useState(0);

  const currentData = () => {
    if (currentYear === 2021) {
      return _2021;
    } else {
      return _2022;
    }
  };

  const isTransitionCompleted = useValue(1);
  const transitionState = useValue({
    currentChart: 0,
    nextChart: 1,
  });
  const GRAPH_HEIGHT = 300;
  const GRAPH_WIDTH = 12 * 50;

  const makeGraph = (data) => {
    const max = Math.max(...data.map((val) => val.value));
    const min = Math.min(...data.map((val) => val.value));
    const y = scaleLinear().domain([0, max]).range([GRAPH_HEIGHT, 35]);

    const x = scaleLinear()
      .domain([0, 12])
      .range([0, GRAPH_WIDTH + 52]);

    const curvedLine = line()
      .x((d) => x(d.month))
      .y((d) => y(d.value))
      .curve(curveBumpX)(data);

    const skPath = Skia.Path.MakeFromSVGString(curvedLine);

    return {
      max,
      min,
      curve: skPath,
    };
  };
  const graphData = [makeGraph(_2021), makeGraph(_2022)];

  const transitionCharts = (target, year) => {
    setCurrentYear(year);
    transitionState.current = {
      currentChart: target,
      nextChart: transitionState.current.currentChart,
    };

    isTransitionCompleted.current = 0;

    runTiming(isTransitionCompleted, 1, {
      duration: 500,
      easing: Easing.inOut(Easing.cubic),
    });
  };

  const currentPath = useComputedValue(() => {
    const start = graphData[transitionState.current.currentChart].curve;
    const end = graphData[transitionState.current.nextChart].curve;
    const result = start.interpolate(end, isTransitionCompleted.current);

    return result.toSVGString() ?? "";
  }, [isTransitionCompleted, transitionState]);

  const getMonth = (value) => {
    switch (value) {
      case 0:
        return "Jan";
      case 1:
        return "Fev";
      case 2:
        return "Mar";
      case 3:
        return "Abr";
      case 4:
        return "Mai";
      case 5:
        return "Jun";
      case 6:
        return "Jul";
      case 7:
        return "Ago";
      case 8:
        return "Set";
      case 9:
        return "Out";
      case 10:
        return "Nov";
      case 11:
        return "Dez";
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" backgroundColor="#121212" />
      <View style={styles.top}>
        <Text style={styles.title}>Gráfico de faturamento mensal</Text>
        <Text style={styles.subtitle}>
          {currentYear} -{" "}
          {`R$${currentData()
            [currentMonth].value.toFixed(2)
            .replace(".", ",")}`}
        </Text>
      </View>
      <View style={{ height: GRAPH_HEIGHT }}>
        <ScrollView
          horizontal
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
        >
          <Canvas
            style={{
              width: GRAPH_WIDTH,
              height: GRAPH_HEIGHT,
            }}
          >
            <Line
              strokeWidth={1}
              color="lightgrey"
              p1={vec(0, 0)}
              p2={vec(12 * 50, 0)}
            />
            <Line
              strokeWidth={1}
              color="lightgrey"
              p1={vec(0, 130)}
              p2={vec(12 * 50, 130)}
            />
            <Line
              strokeWidth={1}
              color="lightgrey"
              p1={vec(0, 250)}
              p2={vec(12 * 50, 250)}
            />

            <Path
              style="stroke"
              path={currentPath}
              color="#2176FF"
              strokeWidth={10}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(GRAPH_WIDTH, 128)}
                colors={["#99C0FFDD", "#99C0FF", "#2176FFAA", "#2176FFDD"]}
              />
            </Path>
          </Canvas>
          <View style={{ flexDirection: "row", position: "absolute" }}>
            {_2021.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => setCurrentMonth(item.month)}
              >
                <View
                  style={{
                    width: 46,
                    height: 300 - 50,
                    marginHorizontal: 2,
                    paddingRight: 4,
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.graphLabel}>
                    {" "}
                    {`${getMonth(item.month)}.`}
                  </Text>
                </View>
                {item.month === currentMonth && (
                  <Gradient.LinearGradient
                    style={{
                      width: 48,
                      height: 245,
                      position: "absolute",
                    }}
                    colors={[
                      "transparent",
                      "rgba(33, 118, 255, 0.03)",
                      "rgba(33, 118, 255, 0.3)",
                      "rgba(33, 118, 255, 1)",
                    ]}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.button}
          onPress={() => transitionCharts(0, 2021)}
        >
          <Text style={styles.buttonText}>2021</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.button}
          onPress={() => transitionCharts(1, 2022)}
        >
          <Text style={styles.buttonText}>2022</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  top: {
    width: "100%",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 56,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#2176FF",
  },
  subtitle: {
    fontWeight: "bold",
    fontSize: 32,
  },
  button: {
    backgroundColor: "#2176FF",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginHorizontal: 8,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  graphLabel: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
