import React from 'react';
import { AttributeOption, ProductAttribute } from '../../types';
import styles from './AttributeSelector.module.css';

interface AttributeSelectorProps {
  attributes: ProductAttribute[];
  selectedAttributes: Record<string, string>;
  onAttributeChange: (attributeName: string, value: string) => void;
  disabled?: boolean;
}

const colorClassMap: Record<string, string> = {
  black: styles.colorBlack,
  white: styles.colorWhite,
  blue: styles.colorBlue,
  red: styles.colorRed,
  gold: styles.colorGold,
  silver: styles.colorSilver,
  green: styles.colorGreen,
  pink: styles.colorPink,
};

const AttributeSelector: React.FC<AttributeSelectorProps> = ({
  attributes,
  selectedAttributes,
  onAttributeChange,
  disabled = false,
}) => {
  const getOptionClassName = (attribute: ProductAttribute, optionValue: string) => {
    const classes = [styles.optionButton];

    if (attribute.type === 'color') {
      classes.push(styles.colorOption);
      const colorClass = colorClassMap[optionValue];
      if (colorClass) {
        classes.push(colorClass);
      }
    }

    if (attribute.type === 'size') {
      classes.push(styles.sizeOption);
    }

    if (attribute.type === 'specification') {
      classes.push(styles.specOption);
    }

    if (selectedAttributes[attribute.name] === optionValue) {
      classes.push(styles.selected);
    }

    if (disabled) {
      classes.push(styles.disabled);
    }

    return classes.join(' ');
  };

  const handleOptionClick = (attributeName: string, optionValue: string) => {
    if (disabled) {
      return;
    }

    onAttributeChange(attributeName, selectedAttributes[attributeName] === optionValue ? '' : optionValue);
  };

  const renderPriceModifier = (modifier?: number) => {
    if (!modifier) {
      return null;
    }

    const className = modifier > 0 ? styles.positive : styles.negative;
    const sign = modifier > 0 ? '+' : '-';

    return (
      <span className={`${styles.priceModifier} ${className}`}>
        ({sign}¥{Math.abs(modifier)})
      </span>
    );
  };

  const renderOption = (attribute: ProductAttribute, option: AttributeOption) => {
    if (attribute.type === 'color') {
      return (
        <button
          key={option.value}
          className={getOptionClassName(attribute, option.value)}
          onClick={() => handleOptionClick(attribute.name, option.value)}
          disabled={disabled}
          title={option.label}
          type="button"
          aria-label={`选择${attribute.name}: ${option.label}`}
        >
          <span className={styles.colorSwatch} />
        </button>
      );
    }

    return (
      <button
        key={option.value}
        className={getOptionClassName(attribute, option.value)}
        onClick={() => handleOptionClick(attribute.name, option.value)}
        disabled={disabled}
        type="button"
        aria-label={`选择${attribute.name}: ${option.label}`}
      >
        {option.label}
        {renderPriceModifier(option.priceModifier)}
      </button>
    );
  };

  if (!attributes.length) {
    return null;
  }

  return (
    <div className={styles.attributeSelector}>
      {attributes.map((attribute) => (
        <div key={attribute.name} className={styles.attributeGroup}>
          <label className={styles.attributeLabel}>
            {attribute.name}
            {attribute.options.length > 0 ? <span className={styles.requiredIndicator}>*</span> : null}
          </label>

          <div className={styles.optionsList}>
            {attribute.options.map((option) => renderOption(attribute, option))}
          </div>

          {attribute.options.length > 0 && !selectedAttributes[attribute.name] ? (
            <div className={styles.attributeError}>请选择 {attribute.name}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default AttributeSelector;
