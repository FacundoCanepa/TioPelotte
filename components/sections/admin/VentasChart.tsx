"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
    type ChartOptions,
  type ChartData,
  type Tick,
  type Scale,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  labels: string[];
  values: number[];
}

export default function VentasChart({ labels, values }: Props) {
  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: "Ventas ($)",
        data: values,
        backgroundColor: "#D16A45",
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };

 const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 12,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#5A3E1B",
        titleColor: "#FFF8EC",
        bodyColor: "#FFF8EC",
        cornerRadius: 6,
        padding: 10,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#5A3E1B",
          font: { family: "Garamond", size: 12 },
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: "#5A3E1B",
          font: { family: "Garamond", size: 12 },
          callback(
            this: Scale,
            value: string | number,
            _index: number,
            _ticks: Tick[]
          ) {
            const numericValue = typeof value === "string" ? parseFloat(value) : value;
            return `$${numericValue.toLocaleString("es-AR")}`;
          },
        },
        grid: {
          color: "#E0E0E0",
        },
      },
    },
  } as const;

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full h-[260px] sm:h-[320px] lg:h-[420px] overflow-hidden">
      <h2 className="text-xl font-semibold text-[#8B4513] mb-4">Ventas mensuales</h2>
      <p className="text-sm italic text-[#5A3E1B]">
  * Solo se contabilizan pedidos con estado <strong>Entregado</strong>.
</p>

      <Bar options={options} data={data} />
    </div>
  );
}
