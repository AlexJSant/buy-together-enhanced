import React from 'react'
import { useCssHandles } from 'vtex.css-handles'
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
  'totalProducts',
  'buyTogetherProductList',
  'buyTogetherProductItem',
  'totalProductsCount',
  'arrowDisabled',
  'buyButton',
  'arrowNext',
  'arrowPrev',
  'arrow',
]

interface BuyTogetherTitleProps {
  text: string
}

const BuyTogetherTitle: React.FC<BuyTogetherTitleProps> = ({
  text = 'Aproveite, e leve junto',
}) => {
  const { handles } = useCssHandles(CSS_HANDLES)

  return (
    <div
      className={`h-100 flex justify-center ${handles.buyTogetherTitleContainer}`}
    >
      <p className={`t-heading-2 c-on-base ${handles.buyTogetherTitle}`}>
        {text}
      </p>
    </div>
  )
}

export default BuyTogetherTitle
