// components/sections/historia/HistoriaTimeline.tsx
"use client";

import { historiaData } from "./historiaData";
import HistoriaItem from "./HistoriaItem";

const HistoriaTimeline = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-24 space-y-32">
      {historiaData.map((item, index) => (
        <HistoriaItem
          key={item.year}
          year={item.year}
          title={item.title}
          description={item.description}
          note={item.note}
          images={item.images}
          iconColor={item.iconColor}
          reversed={index % 2 === 1}
        />
      ))}
    </div>
  );
};

export default HistoriaTimeline;
