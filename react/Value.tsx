import React from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { FormattedCurrency } from 'vtex.format-currency'

import { useBuyTogether } from './Context'

const CSS_HANDLES = [
  'buyTogetherContainer',
  'currentProduct',
  'currentProductWrapper',
  'productList',
  'buyTogetherTitleContainer',
  'buyTogetherTitle',
  'buyTogetherInfo',
  'totalValue',
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
]

interface BuyTogetherValueProps {}

const BuyTogetherValue: React.FC<BuyTogetherValueProps> = () => {
  const { handles } = useCssHandles(CSS_HANDLES)
  const { simplifiedTotalPrice, customText, showCustomText } = useBuyTogether()

  if (!simplifiedTotalPrice) return null

  return (
    <p className={`${handles.totalValue}`}>
      <FormattedCurrency value={simplifiedTotalPrice} />
      {showCustomText && customText && (
        <span className={handles.customText}> {customText}</span>
      )}
    </p>
  )
}

export default BuyTogetherValue
