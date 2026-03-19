import React, { useMemo } from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { FormattedCurrency } from 'vtex.format-currency'
import { IOMessageWithMarkers } from 'vtex.native-types'
import { useBuyTogether } from './Context'
import './styles.css'

const CSS_HANDLES = ['discountWrapper', 'discountPercentage']

interface DiscountProps {
  message: string
  markers: string[]
  minimumPercentage: number
}

const Discount: React.FC<DiscountProps> = ({
  message = 'com {percentage}% de desconto',
  minimumPercentage = 0,
  markers = [],
}) => {
  const { handles } = useCssHandles(CSS_HANDLES)
  const { simplifiedTotalPrice, totalPrice } = useBuyTogether()

  const [percentage, amount] = useMemo(() => {
    if (!simplifiedTotalPrice) return [0, 0]
    if (totalPrice < simplifiedTotalPrice) {
      const totalPriceInPercentage = (totalPrice * 100) / simplifiedTotalPrice
      const discountInPercentage = Math.floor(totalPriceInPercentage - 100)
      const discountInAmount = simplifiedTotalPrice - totalPrice
      return [discountInPercentage, discountInAmount]
    }
    return [0, 0]
  }, [simplifiedTotalPrice, totalPrice])

  if (percentage <= minimumPercentage || amount === 0) return null

  return (
    <div className={handles.discountWrapper}>
      <IOMessageWithMarkers
        handleBase="discount"
        message={message}
        markers={markers}
        values={{
          amount: <FormattedCurrency value={amount} key="discountAmount" />,
          percentage: (
            <span
              className={handles.discountPercentage}
              key="discountPercentage"
            >
              {percentage}
            </span>
          ),
        }}
      />
    </div>
  )
}

export default Discount
