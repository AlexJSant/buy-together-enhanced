import React, { useEffect, useState } from 'react'
import { defineMessages } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { CustomClasses } from 'vtex.css-handles/react/CssHandlesTypes'
import axios from 'axios'

import InstallmentRender, { CSS_HANDLES } from './components/InstallmentRender'
import { useBuyTogether } from './Context'
import './styles.css'
import { getBetterInstallments } from './utils'
import { InstallmentItem } from './typings/types'

const messages = defineMessages({
  title: {
    id: 'admin/editor.buy-together.installments.title',
  },
  description: {
    id: 'admin/editor.buy-together.installments.description',
  },
  default: {
    id: 'store/buy-together.installments.default',
  },
})

interface Props {
  message?: string
  markers?: string[]
  /** Used to override default CSS handles */
  classes?: CustomClasses<typeof CSS_HANDLES>
}

const BuyTogetherInstallments: React.FC<Props> = ({
  message = messages.default.id,
  markers = [],
  classes,
}) => {
  const { handles } = useCssHandles(CSS_HANDLES, { classes })
  const [installments, setInstallments] = useState<InstallmentItem | null>(null)
  const { cartItems } = useBuyTogether()

  useEffect(() => {
    if (!cartItems) return

    axios
      .post('/api/checkout/pub/orderforms/simulation', {
        items: [...cartItems],
      })
      .then(response => {
        const installmentsData = response?.data?.paymentData?.installmentOptions

        setInstallments(getBetterInstallments(installmentsData))
      })
  }, [cartItems])

  if (!installments) return null

  return (
    <InstallmentRender
      message={message}
      markers={markers}
      handles={handles}
      installment={{
        ...installments,
        value: installments.value / 100,
      }}
    />
  )
}

export default BuyTogetherInstallments
