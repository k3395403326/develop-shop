import React, { useEffect, useState } from 'react';
import styles from './ProgressiveImage.module.css';

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc: string;
  secondaryFallbackSrc?: string;
  imageClassName?: string;
  placeholderClassName?: string;
  wrapperClassName?: string;
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  alt,
  className,
  fallbackSrc,
  secondaryFallbackSrc,
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
  const [fallbackStep, setFallbackStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    setCurrentSrc(src && src.trim().length > 0 ? src : fallbackSrc);
    setIsLoading(true);
    setFallbackStep(0);
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

          if (fallbackStep === 0 && secondaryFallbackSrc && currentSrc !== secondaryFallbackSrc) {
            setCurrentSrc(secondaryFallbackSrc);
            setFallbackStep(1);
            setIsLoading(true);
            return;
          }

          if (fallbackStep < 2 && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setFallbackStep(2);
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
