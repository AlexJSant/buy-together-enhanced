import React from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { FormattedCurrency } from 'vtex.format-currency'

import { useBuyTogether } from './Context'
import './styles.css'

const CSS_HANDLES = [
  'buyTogetherContainer',
  'currentProduct',
  'currentProductWrapper',
  'productList',
  'buyTogetherTitleContainer',
  'buyTogetherTitle',
  'buyTogetherInfo',
  'totalValue',
  'totalValuePrices',
  'totalProducts',
  'buyTogetherProductList',
  'buyTogetherProductItem',
  'totalProductsCount',
  'arrowDisabled',
  'buyButton',
  'arrowNext',
  'arrowPrev',
  'arrow',
  'customText',
  'totalValueOriginal',
  'totalValueDiscounted',
  'totalValueLabel',
]

interface BuyTogetherValueProps {}

const BuyTogetherValue: React.FC<BuyTogetherValueProps> = () => {
  const { handles } = useCssHandles(CSS_HANDLES)
  const {
    simplifiedTotalPrice,
    totalPrice,
    customText,
    showCustomText,
  } = useBuyTogether()

  if (!simplifiedTotalPrice) return null

  const hasDiscount =
    simplifiedTotalPrice > 0 &&
    totalPrice > 0 &&
    simplifiedTotalPrice < totalPrice

  return (
    <p className={`${handles.totalValue}`}>
      <span className={handles.totalValuePrices}>
        {/* Quando houver preço cheio e desconto visual, exibimos os dois valores */}
        {hasDiscount ? (
          <>
            <span className={handles.totalValueOriginal}>
              <FormattedCurrency value={totalPrice} />
            </span>
            <span className={handles.totalValueDiscounted}>
              <FormattedCurrency value={simplifiedTotalPrice} />
            </span>
          </>
        ) : (
          // Fallback: quando não houver desconto configurado, mostrar apenas o total "cheio"
          <span className={handles.totalValueOriginal}>
            <FormattedCurrency value={simplifiedTotalPrice} />
          </span>
        )}
      </span>
      {showCustomText && customText && (
        <span className={handles.customText}>{customText}</span>
      )}
    </p>
  )
}

export default BuyTogetherValue
