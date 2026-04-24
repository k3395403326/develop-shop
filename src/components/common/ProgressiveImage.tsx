import React, { useEffect, useState } from 'react';
import styles from './ProgressiveImage.module.css';

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc: string;
  imageClassName?: string;
  placeholderClassName?: string;
  wrapperClassName?: string;
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  alt,
  className,
  fallbackSrc,
  imageClassName,
  placeholderClassName,
  src,
  wrapperClassName,
  onError,
  onLoad,
  ...imageProps
}) => {
  const [currentSrc, setCurrentSrc] = useState(src ?? fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentSrc(src && src.trim().length > 0 ? src : fallbackSrc);
    setIsLoading(true);
  }, [fallbackSrc, src]);

  return (
    <span className={`${styles.wrapper} ${wrapperClassName ?? ''} ${className ?? ''}`}>
      {isLoading ? <span className={`${styles.placeholder} ${placeholderClassName ?? ''}`} /> : null}

      <img
        {...imageProps}
        alt={alt}
        className={`${styles.image} ${isLoading ? styles.hidden : styles.visible} ${imageClassName ?? ''}`}
        src={currentSrc}
        onError={(event) => {
          onError?.(event);

          if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setIsLoading(true);
            return;
          }

          setIsLoading(false);
        }}
        onLoad={(event) => {
          onLoad?.(event);
          setIsLoading(false);
        }}
      />
    </span>
  );
};

export default ProgressiveImage;
