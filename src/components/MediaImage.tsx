import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { mediaUrl, PLACEHOLDER } from "../lib/media";

interface MediaImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
}

export default function MediaImage({ src, alt = "", onError, ...props }: MediaImageProps) {
  const resolved = mediaUrl(src);
  const [currentSrc, setCurrentSrc] = useState(resolved);

  useEffect(() => {
    setCurrentSrc(resolved);
  }, [resolved]);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(e) => {
        if (currentSrc !== PLACEHOLDER) setCurrentSrc(PLACEHOLDER);
        onError?.(e);
      }}
    />
  );
}
