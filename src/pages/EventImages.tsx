import { useState } from "react";

export const EventImages = ({ images }: { images: string[] }) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      {/* Image thumbnails */}
      <div className="event-images">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Event image ${i + 1}`}
            onClick={() => setSelected(src)}
          />
        ))}
      </div>

      {/* Popup / overlay */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "pointer",
          }}
        >
          <img
            src={selected}
            alt="Full size"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "8px",
            }}
          />
        </div>
      )}
    </>
  );
};