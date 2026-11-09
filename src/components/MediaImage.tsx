import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { mediaUrl, PLACEHOLDER, buildSrcSet } from "../lib/media";

interface MediaImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
}

export default function MediaImage({ src, alt = "", onError, ...props }: MediaImageProps) {
  const resolved = mediaUrl(src);
  const [currentSrc, setCurrentSrc] = useState(resolved);

  useEffect(() => {
    setCurrentSrc(resolved);
  }, [resolved]);

  const { loading, decoding, ...rest } = props as ImgHTMLAttributes<HTMLImageElement>;

  return (
    <img
      {...rest}
      src={currentSrc}
      alt={alt}
      loading={loading ?? "lazy"}
      decoding={decoding ?? "async"}
      srcSet={rest.srcSet ?? buildSrcSet(currentSrc)}
      onError={(e) => {
        if (currentSrc !== PLACEHOLDER) setCurrentSrc(PLACEHOLDER);
        onError?.(e);
      }}
    />
  );
}
