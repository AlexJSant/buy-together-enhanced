import * as React from 'react'
import { ExtensionPoint } from 'vtex.render-runtime'
import { useCssHandles } from 'vtex.css-handles'

import { useBuyTogether, BuyTogetherContextProps } from './Context'

import './swiper.global.css'

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
  'swiperPagination',
  'swiperBulletActive',
  'swiperBullet',
  'swiperWrapper',
]

const ProductLists: React.FC = () => {
  const { handles } = useCssHandles(CSS_HANDLES)
  const context = useBuyTogether() as BuyTogetherContextProps
  const { normalizedProductList, showListMode, useManualSku } = context

  const MAX_LIST_ITEMS = 8

  const itemsToRender = React.useMemo(() => {
    if (!normalizedProductList || normalizedProductList.length === 0) {
      return []
    }

    // Quando há SKU manual ativo, o modo lista é ignorado e usamos sempre um único item
    if (useManualSku || !showListMode) {
      return [normalizedProductList[0]]
    }

    // Modo lista ativo com cross-sell:
    // 1. Fazemos uma cópia para não mutar o array original
    // 2. Randomizamos a ordem
    // 3. Limitamos a quantidade exibida para evitar listas muito grandes
    const copied = [...normalizedProductList]

    for (let i = copied.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = copied[i]
      copied[i] = copied[j]
      copied[j] = temp
    }

    return copied.slice(0, MAX_LIST_ITEMS)
  }, [normalizedProductList, showListMode, useManualSku])

  return (
    <div className={`h-100 w-100 ${handles.productList}`}>
      <div className={`${handles.buyTogetherProductList} pv4`}>
        {itemsToRender &&
          itemsToRender.length > 0 &&
          itemsToRender.map((product: any, index: number) => (
            <div
              key={product?.sku?.itemId ?? index}
              data-item-id={product?.sku?.itemId ?? `item-${index}`}
              className={`${handles.buyTogetherProductItem} pv2`}
            >
              <ExtensionPoint id="product-summary" product={product} />
            </div>
          ))}
      </div>
    </div>
  )
}

export default ProductLists
