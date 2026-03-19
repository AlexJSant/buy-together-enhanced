import React, { useContext } from 'react'

export interface BuyTogetherContextProps {
  handleSlideChange: Function
  normalizedBaseProduct: any
  normalizedProductList: any[]
  cartItems: any
  simplifiedTotalPrice: number
  totalPrice: number
  setTotalPrice: Function
  customText: string
  showCustomText: boolean
  /** Quando true, o botão de comprar aplica um cupom informado pelo editor */
  showBuyWithCoupon: boolean
  /** Código do cupom a ser aplicado via Checkout API */
  couponCode: string
  /** Quando true, ignora o cross-sell e usa o SKU informado em manualSkuId */
  useManualSku: boolean
  /** Quando true (e sem SKU manual ativo), exibe múltiplos itens de cross-sell em vez de apenas um */
  showListMode: boolean
  message?: string
}

export const BuyTogetherContextDefault = {
  handleSlideChange: () => {},
  normalizedBaseProduct: {},
  normalizedProductList: [],
  cartItems: [1],
  simplifiedTotalPrice: 0,
  totalPrice: 0,
  setTotalPrice: () => {},
  customText: 'PIX',
  showCustomText: false,
  showBuyWithCoupon: false,
  couponCode: '',
  useManualSku: false,
  showListMode: false,
  message: undefined,
}

export const BuyTogetherContext = React.createContext<BuyTogetherContextProps>(
  BuyTogetherContextDefault
)

export const useBuyTogether = () => useContext(BuyTogetherContext)
