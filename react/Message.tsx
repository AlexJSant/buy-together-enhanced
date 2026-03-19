import React, { ReactNode } from 'react'
import { useCssHandles } from 'vtex.css-handles'
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

interface BuyTogetherMessageProps {
  message?: ReactNode
  children?: ReactNode
}

const BuyTogetherMessage: StorefrontFunctionComponent<BuyTogetherMessageProps> = ({
  message,
  children,
}) => {
  const { handles } = useCssHandles(CSS_HANDLES)
  const { message: contextMessage } = useBuyTogether()
  const content =
    children ?? message ?? contextMessage ?? 'Compre o conjunto por:'

  return (
    <h2 className={handles.buyTogetherInfo}>
      {content}
    </h2>
  )
}

BuyTogetherMessage.schema = {
  title: 'Mensagem Compre Junto',
  description: 'Texto exibido acima do valor total no Compre Junto.',
  type: 'object',
  properties: {
    message: {
      title: 'Mensagem',
      description: 'Texto da mensagem do Compre Junto.',
      type: 'string',
      default: 'Compre o conjunto por:',
    },
  },
}

export default BuyTogetherMessage
