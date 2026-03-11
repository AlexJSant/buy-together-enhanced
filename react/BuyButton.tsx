import React from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { useProduct } from 'vtex.product-context'
import axios from 'axios'

import { useBuyTogether } from './Context'

interface BuyTogetherBuyButtonProps {
  BuyButton: React.ComponentType<{ skuItems: CartItem[] }>
}

const CSS_HANDLES = ['buyButton']

const BuyTogetherBuyButton: React.FC<BuyTogetherBuyButtonProps> = ({
  BuyButton,
}) => {
  const { cartItems } = useBuyTogether()
  const { handles } = useCssHandles(CSS_HANDLES)
  const productContext = useProduct() as any
  const { product } = productContext || {}

  const handleClick = async () => {
    try {
      const skuId = product?.items?.[0]?.itemId || product?.sku?.itemId

      if (!skuId) {
        return
      }

      const utmSource = `Compre Junto - Principal: ${skuId}`

      const orderFormResponse = await axios.post(
        '/api/checkout/pub/orderForm',
        {}
      )

      const orderFormId = orderFormResponse.data?.orderFormId

      if (!orderFormId) {
        return
      }

      await axios.post(
        `/api/checkout/pub/orderForm/${orderFormId}/attachments/marketingData`,
        {
          utmSource,
          utmMedium: 'buy-together',
          utmCampaign: 'compre_junto',
        }
      )
    } catch (e) {
      console.error('Erro ao anexar marketingData do Compre Junto', e)
    }
  }

  return (
    <div className={`${handles.buyButton}`} onClick={handleClick}>
      <BuyButton skuItems={cartItems} />
    </div>
  )
}

export default BuyTogetherBuyButton
