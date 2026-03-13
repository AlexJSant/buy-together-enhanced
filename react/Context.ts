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
  useManualSku: false,
  showListMode: false,
  message: undefined,
}

export const BuyTogetherContext = React.createContext<BuyTogetherContextProps>(
  BuyTogetherContextDefault
)

export const useBuyTogether = () => useContext(BuyTogetherContext)
