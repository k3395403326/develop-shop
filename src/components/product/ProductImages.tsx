import React, { useEffect, useMemo, useState } from 'react';
import { getDefaultImage } from '../../utils/imageUtils';
import styles from './ProductImages.module.css';

interface ProductImagesProps {
  images: string[];
  productName: string;
  selectedAttributes?: Record<string, string>;
}

const ProductImages: React.FC<ProductImagesProps> = ({
  images,
  productName,
  selectedAttributes = {},
}) => {
  const galleryImages = useMemo(() => {
    const cleanedImages = images.filter((image) => image.trim().length > 0);

    return cleanedImages.length > 0 ? cleanedImages : [getDefaultImage(640, 640, productName)];
  }, [images, productName]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({ 0: false });
  const [showZoom, setShowZoom] = useState(false);
  const fallbackImage = getDefaultImage(640, 640, productName);

  useEffect(() => {
    setCurrentImageIndex(0);
    setImageErrors({});
    setImageLoading({ 0: false });
  }, [galleryImages]);

  useEffect(() => {
    const selectedColor = selectedAttributes['颜色'];

    if (!selectedColor || galleryImages.length <= 1) {
      return;
    }

    const colorIndexMap: Record<string, number> = {
      black: 0,
      white: 1,
      blue: 2,
      red: 3,
      gold: 3,
      silver: 1,
    };

    const nextIndex = colorIndexMap[selectedColor];

    if (nextIndex !== undefined && nextIndex < galleryImages.length) {
      setCurrentImageIndex(nextIndex);
      setImageLoading((previous) => ({ ...previous, [nextIndex]: false }));
    }
  }, [galleryImages.length, selectedAttributes]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!showZoom) {
        return;
      }

      if (event.key === 'Escape') {
        setShowZoom(false);
      }

      if (event.key === 'ArrowLeft') {
        setCurrentImageIndex((previous) => (previous > 0 ? previous - 1 : galleryImages.length - 1));
      }

      if (event.key === 'ArrowRight') {
        setCurrentImageIndex((previous) => (previous < galleryImages.length - 1 ? previous + 1 : 0));
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [galleryImages.length, showZoom]);

  const currentImage = imageErrors[currentImageIndex]
    ? fallbackImage
    : galleryImages[currentImageIndex] ?? fallbackImage;
  const isLoading = imageLoading[currentImageIndex] ?? false;

  return (
    <div className={styles.productImages}>
      <div className={styles.mainImageContainer} onClick={() => setShowZoom(true)}>
        {isLoading ? <div className={styles.imagePlaceholder}>Loading...</div> : null}

        <img
          src={currentImage}
          alt={`${productName} ${currentImageIndex + 1}`}
          className={styles.mainImage}
          onLoad={() => setImageLoading((previous) => ({ ...previous, [currentImageIndex]: false }))}
          onError={() => {
            setImageErrors((previous) => ({ ...previous, [currentImageIndex]: true }));
            setImageLoading((previous) => ({ ...previous, [currentImageIndex]: false }));
          }}
          style={{ display: isLoading ? 'none' : 'block' }}
        />

        {galleryImages.length > 1 ? (
          <>
            <button
              className={`${styles.navigationButton} ${styles.prevButton}`}
              onClick={(event) => {
                event.stopPropagation();
                setCurrentImageIndex((previous) => (previous > 0 ? previous - 1 : galleryImages.length - 1));
              }}
              type="button"
              aria-label="Previous image"
            >
              {'<'}
            </button>
            <button
              className={`${styles.navigationButton} ${styles.nextButton}`}
              onClick={(event) => {
                event.stopPropagation();
                setCurrentImageIndex((previous) => (previous < galleryImages.length - 1 ? previous + 1 : 0));
              }}
              type="button"
              aria-label="Next image"
            >
              {'>'}
            </button>
            <div className={styles.imageCounter}>
              {currentImageIndex + 1} / {galleryImages.length}
            </div>
          </>
        ) : null}
      </div>

      {galleryImages.length > 1 ? (
        <div className={styles.thumbnailContainer}>
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              className={`${styles.thumbnail} ${index === currentImageIndex ? styles.active : ''}`}
              onClick={() => setCurrentImageIndex(index)}
              type="button"
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className={styles.thumbnailImage}
                onError={() => setImageErrors((previous) => ({ ...previous, [index]: true }))}
              />
            </button>
          ))}
        </div>
      ) : null}

      {showZoom ? (
        <div className={styles.zoomModal} onClick={() => setShowZoom(false)}>
          <img
            src={currentImage}
            alt={`${productName} zoomed`}
            className={styles.zoomedImage}
            onClick={(event) => event.stopPropagation()}
          />
          <button className={styles.closeButton} onClick={() => setShowZoom(false)} type="button">
            x
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ProductImages;
