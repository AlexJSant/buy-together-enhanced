import React, { useEffect, useState, useMemo, ReactNode } from 'react'
import { useProduct } from 'vtex.product-context'
import { useQuery } from 'react-apollo'
import { ProductListContext } from 'vtex.product-list-context'
import ProductSummary from 'vtex.product-summary/ProductSummaryCustom'
import { PreferenceType } from 'vtex.product-summary/react/utils/normalize'
import { useCssHandles } from 'vtex.css-handles'
import { ProductGroupContext } from 'vtex.product-group-context'
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
import axios from 'axios'

import './intlMessages'
import { BuyTogetherContext } from './Context'
import getProducts from './graphql/getProduct.gql'
import { mapSKUItemsToCartItems } from './utils'
import { AllSkus } from './utils/normalize'

const { ProductListProvider } = ProductListContext
const { ProductGroupProvider, useProductGroup } = ProductGroupContext

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

interface BuyTogetherProps {
  showAllSkus?: boolean
  children: ReactNode
  preferredSKU: PreferenceType
  discountPercentage?: number
  customText?: string
  showCustomText?: boolean
  /** Quando true, ignora o cross-sell e usa o SKU informado em manualSkuId */
  useManualSku?: boolean
  /** SKU único a ser usado como produto sugerido quando useManualSku estiver habilitado */
  manualSkuId?: string
  /** Mensagem exibida acima do valor total no Compre Junto */
  message?: string
  /**
   * Quando true (e sem SKU manual ativo), exibe múltiplos itens de cross-sell
   * em vez de apenas um no bloco buy-together-product-list.
   * Padrão: false (mantém comportamento atual de 1 item).
   */
  showListMode?: boolean
}

const notNull = (item: CartItem | null): item is CartItem => item !== null

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y])

const BuyTogether: StorefrontFunctionComponent = ({
  children,
  showAllSkus = false,
  preferredSKU = 'FIRST_AVAILABLE',
  discountPercentage = 0,
  customText = 'Texto Personalizado',
  showCustomText = false,
  useManualSku = false,
  manualSkuId,
  message = 'Compre o conjunto por:',
  showListMode = false,
}: BuyTogetherProps) => {
  const productContext = useProduct() as any
  const { product } = productContext
  const [showTogetherIds, setShowTogetherIds] = useState<number[]>([])
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const { handles } = useCssHandles(CSS_HANDLES)
  const { items } = useProductGroup()!
  const [currentItems, setCurrentItens] = useState(0)

  const [orderedItems, setOrderedItems] = useState<Item[]>()

  useEffect(() => {
    if (useManualSku) {
      if (manualSkuId) {
        const parsed = Number(manualSkuId)
        if (!Number.isNaN(parsed)) {
          setShowTogetherIds([parsed])
        } else {
          setShowTogetherIds([])
        }
      } else {
        setShowTogetherIds([])
      }
      return
    }

    getShowTogetherIds()
  }, [product, useManualSku, manualSkuId])

  const getShowTogetherIds = async () => {
    const rawResult = await axios(
      `/api/catalog_system/pub/products/crossselling/showtogether/${product.productId}`
    )

    const skuIDs = rawResult.data.map((item: any) => item.items[0].itemId)

    setShowTogetherIds(skuIDs)
  }

  const { data } = useQuery(getProducts, {
    variables: {
      skuId: showTogetherIds,
    },
  })

  const normalizedBaseProduct = useMemo(
    () => ProductSummary.mapCatalogProductToProductSummary(product),
    [product]
  )

  const normalizedProductList = useMemo(() => {
    const skus = showAllSkus
      ? data?.productsByIdentifier
          .map((productItem: Product) => {
            return AllSkus(productItem)
          })
          .flat() || []
      : data?.productsByIdentifier || []

    return skus
      ?.map((e: any) =>
        ProductSummary.mapCatalogProductToProductSummary(e, preferredSKU)
      )
      .sort((a: any, b: any) => {
        if (Number(a.sku.itemId) > Number(b.sku.itemId)) {
          return 1
        }

        if (Number(a.sku.itemId) < Number(b.sku.itemId)) {
          return -1
        }

        return 0
      })
  }, [data?.productsByIdentifier])

  const filteredItens = useMemo(() => {
    return orderedItems
      ?.filter((_product: any, i: number) => i === currentItems)
      .concat(
        items.filter(item => item.product.productId === product.productId)
      )
  }, [orderedItems, currentItems])

  const cartItems = useMemo(() => {
    if (!filteredItens) return

    return mapSKUItemsToCartItems(filteredItens).filter(notNull)
  }, [filteredItens])

  useEffect(() => {
    setOrderedItems(
      items
        .sort((a: any, b: any) => {
          if (Number(a.product.sku.itemId) > Number(b.product.sku.itemId)) {
            return 1
          }

          if (Number(a.product.sku.itemId) < Number(b.product.sku.itemId)) {
            return -1
          }

          return 0
        })
        .filter(item => item.product.productId !== product.productId)
    )
  }, [items])

  const simplifiedTotalPrice = useMemo(() => {
    if (!cartItems) return 0

    const fullTotal = cartItems.reduce((total: number, currentItem: CartItem) => {
      const itemPrice = currentItem.sellingPrice / 100
      return total + itemPrice
    }, 0)

    setTotalPrice(fullTotal)

    if (discountPercentage > 0) {
      const discountedTotal = cartItems.reduce(
        (total: number, currentItem: CartItem) => {
          const itemPrice = currentItem.sellingPrice / 100
          const discountAmount = (itemPrice * discountPercentage) / 100
          const discountedPrice = itemPrice - discountAmount

          return total + discountedPrice
        },
        0
      )

      return discountedTotal
    }

    return fullTotal
  }, [cartItems, discountPercentage])

  const handleSlideChange = (e: any) => {
    setCurrentItens(Number(e.activeIndex))
  }

  //   if (!showTogether || showTogether?.length === 0) return null
  if (!normalizedProductList.length) return null

  return (
    <BuyTogetherContext.Provider
      value={{
        normalizedBaseProduct,
        normalizedProductList,
        handleSlideChange,
        cartItems,
        simplifiedTotalPrice: Number(simplifiedTotalPrice),
        totalPrice: Number(totalPrice),
        setTotalPrice,
        customText,
        showCustomText,
        useManualSku,
        // Quando há SKU manual ativo, o modo lista é ignorado pela UI do ProductsList
        showListMode,
        message,
      }}
    >
      <ProductListProvider listName="buyTogether">
        <div className={`flex flex-column ${handles.buyTogetherContainer}`}>
          {children}
        </div>
      </ProductListProvider>
    </BuyTogetherContext.Provider>
  )
}


const BuyTogetherWrapper: StorefrontFunctionComponent = props => {
  return (
    <ProductGroupProvider>
      <BuyTogether {...props} />
    </ProductGroupProvider>
  )
}

BuyTogetherWrapper.schema = {
  title: 'Compre Junto',
  description: 'Componente custom de Compre Junto',
  type: 'object',
  properties: {
    message: {
      title: 'Mensagem',
      description: 'Mensagem exibida acima do valor total no Compre Junto.',
      type: 'string',
      default: 'Compre o conjunto por:',
    },
    useManualSku: {
      title: 'Usar SKU manual?',
      description:
        'Quando habilitado, ignora o cross-sell Show Together e utiliza o SKU informado em "SKU manual" como produto sugerido.',
      type: 'boolean',
      default: false,
    },
    manualSkuId: {
      title: 'SKU manual',
      description:
        'ID do SKU a ser utilizado como produto sugerido quando "Usar SKU manual?" estiver habilitado.',
      type: 'string',
    },
    showListMode: {
      title: 'Exibir lista de produtos sugeridos?',
      description:
        'Quando habilitado e sem SKU manual ativo, exibe vários produtos sugeridos do cross-sell Show Together em vez de apenas um. Padrão: desativado.',
      type: 'boolean',
      default: false,
    },
    showCustomText: {
      title: 'Exibir Texto Personalizado?',
      description: 'Se deve exibir o campo Texto Personalizado ao lado do preço',
      type: 'boolean',
      default: false,
    },
    customText: {
      title: 'Texto Personalizado',
      description: 'Texto que será exibido ao lado do preço (ex: PIX, à vista, etc.)',
      type: 'string',
      default: 'Texto Personalizado',
    },
    discountPercentage: {
      title: 'Percentual de Desconto',
      description: 'Percentual de desconto a ser aplicado no preço final (0-100). Nunca deixar vazio! Preencher com 0 (zero) para não aplicar desconto.',
      type: 'number',
      default: 0, // Antes era o desconto padrao do Pix que era 10%
      minimum: 0,
      maximum: 20,
    },
  },
}

export default BuyTogetherWrapper
