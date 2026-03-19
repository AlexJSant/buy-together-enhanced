import React from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { useProduct } from 'vtex.product-context'
import axios from 'axios'

import { useBuyTogether } from './Context'
import './styles.css'

interface BuyTogetherBuyButtonProps {
  BuyButton: React.ComponentType<{
    skuItems: CartItem[]
    text?: string
    /**
     * Permite que o clique do add-to-cart propague para o pai.
     * Isso garante que o onClick do wrapper deste app dispare a lógica de cupom/marketingData.
     */
    onClickEventPropagation?: 'disabled' | 'enabled'
  }>
}

const CSS_HANDLES = ['buyButton']

const BuyTogetherBuyButton: React.FC<BuyTogetherBuyButtonProps> = ({
  BuyButton,
}) => {
  const { cartItems, showBuyWithCoupon, couponCode } = useBuyTogether()
  const { handles } = useCssHandles(CSS_HANDLES)
  const productContext = useProduct() as any
  const { product } = productContext || {}

  const handleClickNormal = async () => {
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

  const handleClickWithCoupon = async () => {
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

      // O `add-to-cart-button` atualiza o minicart/orderForm de forma assíncrona.
      // Para aumentar a chance de o cupom ser aplicado no orderForm correto (e após os itens existirem),
      // fazemos um polling curto no orderForm atual e aplicamos o cupom quando houver itens.
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
      const applyCouponToCurrentOrderForm = async () => {
        if (!couponCode) return

        const currentOrderFormResponse = await axios.get(
          '/api/checkout/pub/orderForm'
        )
        const currentOrderFormId =
          currentOrderFormResponse.data?.orderFormId

        if (!currentOrderFormId) return

        await axios.post(
          `/api/checkout/pub/orderForm/${currentOrderFormId}/coupons`,
          { text: couponCode }
        )
      }

      // Tentamos por até ~2s (ajuste fino depois, se necessário)
      for (let attempt = 0; attempt < 6; attempt++) {
        try {
          const currentOrderFormResponse = await axios.get(
            '/api/checkout/pub/orderForm'
          )
          const items = currentOrderFormResponse.data?.items || []
          if (Array.isArray(items) && items.length > 0) {
            await applyCouponToCurrentOrderForm()
            break
          }
        } catch (e) {
          // Não interrompe a navegação/PDP. Tentaremos novamente no próximo attempt.
          console.error('Erro ao inspecionar orderForm para aplicar cupom', e)
        }

        await sleep(300)
      }
    } catch (e) {
      console.error('Erro ao aplicar cupom do Compre Junto', e)
    }
  }

  return (
    <>
      {showBuyWithCoupon ? (
        <div className={`${handles.buyButton}`} onClick={handleClickWithCoupon}>
          <BuyButton
            skuItems={cartItems}
            text="Leve os Dois com Cupom"
            onClickEventPropagation="enabled"
          />
        </div>
      ) : (
        <div className={`${handles.buyButton}`} onClick={handleClickNormal}>
          <BuyButton
            skuItems={cartItems}
            text="Leve os Dois"
            onClickEventPropagation="enabled"
          />
        </div>
      )}
    </>
  )
}

export default BuyTogetherBuyButton
