import React from 'react'
import { ExtensionPoint } from 'vtex.render-runtime'
import { useCssHandles } from 'vtex.css-handles'

import { useBuyTogether } from './Context'

const CSS_HANDLES = ['currentProduct', 'currentProductWrapper']

const CurrentProduct: React.FC = () => {
  const { handles } = useCssHandles(CSS_HANDLES)
  const { normalizedBaseProduct } = useBuyTogether()

  return (
    <div className={`h-100 w-100 ${handles.currentProduct}`}>
      <ExtensionPoint id="product-summary" product={normalizedBaseProduct} />
    </div>
  )
}

export default CurrentProduct
