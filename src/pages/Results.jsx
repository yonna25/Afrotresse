import { motion } from "framer-motion";
import stylesData from "./stylesData.json";

export default function Results({ styles = [] }) {
  const finalStyles = styles.length ? styles : stylesData;

  return (
    <div className="px-4 py-6 space-y-6">
      {finalStyles.map((style, index) => {
        const imgSrc = style.generatedImage
          ? style.generatedImage
          : `/styles/${style.localImage}`;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden"
          >
            <img
              src={imgSrc}
              alt={style.name}
              className="w-full h-72 object-cover"
              onError={(e) => {
                e.target.src = "/styles/napi1.jpg";
              }}
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{style.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {style.description || "Style tendance adapté à ton visage"}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
