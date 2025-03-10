import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { fetchData } from "../api/charData";
import Loading from "../Components/Loading";
import { useNavigate } from "react-router-dom";

const BrushableStackedBarChart = () => {
  const [dataSave, setDataSave] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const chartData = async () => {
      try {
        const response = await fetchData();
        const data = await response?.json();
        setDataSave(data);
      } catch (error) {
        console.log("Chart Data Error: ", error);
      }
    };
    chartData();
  }, []);

  if (!dataSave)
    return (
      <div className="w-full h-[100vh] flex items-center justify-center">
        <Loading />
      </div>
    );

  const processData = () => {
    let xAxisData = [];
    let cityData = {};
    let validCities = new Set();
    dataSave?.result[0]?.data?.forEach((dataPoint) => {
      Object.entries(dataPoint).forEach(([key, value]) => {
        if (key !== "order_date" && value !== null && value > 0) {
          validCities.add(key);
        }
      });
    });

    dataSave?.result[0]?.data?.forEach((dataPoint) => {
      const date = new Date(dataPoint.order_date);
      const year = date.getFullYear();
      const month = date.toLocaleString("default", { month: "short" });
      if (!xAxisData.some((item) => item.year === year)) {
        xAxisData.push({ year });
      }
      const yearObj = xAxisData.find((item) => item.year === year);
      if (!yearObj.months) {
        yearObj.months = [];
      }
      if (month !== "Jan" && !yearObj.months.includes(month)) {
        yearObj.months.push(month);
      }

      validCities.forEach((city) => {
        if (!cityData[city]) {
          cityData[city] = [];
        }
        let value = dataPoint[city] ?? 0;
        cityData[city].push(value);
      });
    });
    let flattenedXAxisData = [];
    xAxisData.forEach((item) => {
      flattenedXAxisData.push(item.year);
      flattenedXAxisData.push(...item.months);
    });
    return { xAxisData: flattenedXAxisData, cityData };
  };

  const { xAxisData, cityData } = processData();
  const formatYAxis = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };

  const option = {
    legend: {
      type: "scroll",
      data: Object.keys(cityData),
      left: "center",
      top: "5%",
      orient: "horizontal",
      textStyle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
      },
      itemWidth: 14,
      itemHeight: 14,
      itemGap: 15,
      pageIconSize: 14,
      pageButtonGap: 12,
      pageTextStyle: {
        fontSize: 12,
        color: "#666",
      },
      pageButtonPosition: "end",
      pageFormatter: "{current}/{total}",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        let tooltipText = "";
        let validParams = params.filter(
          (item) => item.value !== null && item.value > 0
        );
        if (validParams.length === 0) return "";
        let dateValue = params[0].axisValueLabel; 
        let formattedDate = "";
        let year = "";
        for (let i = params[0].dataIndex; i >= 0; i--) {
          if (/^\d{4}$/.test(xAxisData[i])) {
            year = xAxisData[i];
            break;
          }
        }
        if (/^\d{4}$/.test(dateValue)) {
          formattedDate = dateValue;
        } else if (year) {
          let monthIndex =
            new Date(Date.parse(`${dateValue} 1, 2000`)).getMonth() + 1;
          formattedDate = `${year}-${String(monthIndex).padStart(2, "0")}-01`;
        } else {
          formattedDate = "Unknown Date"; 
        }
        tooltipText += `<b>${formattedDate}</b><br/>`;

        validParams.forEach((item) => {
          tooltipText += `
            <span style="display:inline-block;width:10px;height:10px;background-color:${
              item.color
            };margin-right:5px;border-radius:50%;"></span>
            ${item.seriesName}: <b>${formatYAxis(item.value)}</b><br/>`;
        });

        return tooltipText;
      },
    },

    xAxis: {
      data: xAxisData,
      axisLine: { onZero: true },
      splitLine: { show: false },
      splitArea: { show: false },
      axisLabel: {
        interval: 0,
        formatter: function (value) {
          if (/^\d{4}$/.test(value)) {
            return value;
          }
          if (["Apr", "Jul", "Oct"].includes(value)) {
            return value;
          }
          return "";
        },
      },
    },
    yAxis: {
      axisLabel: {
        formatter: formatYAxis,
      },
    },
    grid: {
      bottom: 100,
    },
    series: Object.keys(cityData).map((city) => ({
      name: city,
      type: "bar",
      stack: "one",
      data: cityData[city],
    })),
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-700 to-purple-800 p-6 gap-5">
      <div className="w-full max-w-6xl flex items-end justify-end">
        <button
          className="inline-flex cursor-pointer items-center gap-1 rounded border border-slate-300 bg-gradient-to-b from-slate-50 to-slate-200 px-4 py-2 font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:opacity-100"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div className="w-full flex-grow">
          <ReactECharts
            option={option}
            style={{ height: "500px", width: "100%" }}
            onEvents={{
              brushSelected: (params) => {
                const brushed = [];
                const brushComponent = params.batch[0];
                brushComponent?.selected.forEach((selection, sIdx) => {
                  const rawIndices = selection.dataIndex;
                  brushed.push(`[Series ${sIdx}] ${rawIndices.join(", ")}`);
                });
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BrushableStackedBarChart;
