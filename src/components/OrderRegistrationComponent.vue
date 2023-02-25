<template>
  <div class="container">
    <section class="row">
      <div class="col-12">
        <nav class="navbar navbar-light bg-light">
          <div class="container-fluid">
            <span class="navbar-brand">Эмулятор заказа</span>
            <Switches v-model="enabled" :label="label" />
          </div>
        </nav>
      </div>
    </section>

    <section class="row my-3">
      <div class="col-3">
        <input
          :value="price"
          @change="onChange({ key: 'price' })"
          @input="onInput($event, 'price')"
          type="text"
          id="price"
          class="form-control"
          placeholder="Цена"
          ref="price"
        >
        <label for="price"><sub>Цена за единицу</sub></label>
      </div>
      <div class="col-3">
        <input
          :value="qty"
          @change="onChange({ key: 'qty' })"
          @input="onInput($event, 'qty')"
          type="text"
          id="qty"
          class="form-control"
          placeholder="Количество"
          ref="qty"
        >
        <label for="qty"><sub>Общее количество</sub></label>
      </div>
      <div class="col-3">
        <input
          :value="amount"
          @change="onChange({ key: 'amount' })"
          @input="onInput($event, 'amount')"
          type="text"
          id="amount"
          class="form-control"
          placeholder="Сумма"
          ref="amount"
        >
        <label for="amount"><sub>Общая стоимость</sub></label>
      </div>
      <div class="col-3">
        <button
          class="btn btn-outline-secondary"
          :disabled="forbidden"
          @click="send"
        >
          Добавить
        </button>
      </div>
    </section>

    <section class="row my-3">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            Состояние хранилища
          </div>

          <div class="card-body">
            <code class="storage__view" v-html="representation" />
          </div>
        </div>
      </div>
    </section>

    <section class="row my-3">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            События
          </div>

          <ul class="list-group list-group-flush">
            <template v-for="(evt, i) in events">
              <li @click="expand" class="list-group-item list-group-item-action dropdown" :key="i">
                <em v-if="evt.extend" class="bi bi-caret-down-fill"></em> {{ evt.desc }}
                <div
                  v-if="evt.extend"
                  class="dropdown-menu"
                  data-collapsed="true"
                  v-html="evt.extend"
                />
              </li>
            </template>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { sendRequest, cutSpaces, stringify, debounce } from '@/utils/common'
import { RuntimeValidator } from '@/utils/validator'
import { Archiver } from '@/utils/archiver'

import Switches from 'vue-switches'

export default {
  name: 'OrderRegistrationComponent',

  components: {
    Switches
  },
  data: () => ({
    archiver: Archiver.init(),
    label: 'Первое измененное',

    correction: false,
    byFirst: true,

    validators: [],
    events: [],

    storage: '',

    order: {
      amount: null,
      nonce: null,
      price: null,
      qty: null
    },
    buffer: {
      amount: 0,
      nonce: 0,
      price: 0,
      qty: 0
    }
  }),
  computed: {
    forbidden() {
      return Object.keys(this.order).filter(k => k !== 'nonce').some(k => this.order[k] === null)
    },
    representation() {
      return `<pre>${this.storage}</pre>`
    },
    enabled: {
      set(v) {
        this.label = v ? 'Первое измененное' : 'Последнее измененное'
        this.byFirst = v
      },
      get() {
        return this.byFirst
      }
    },
    amount: {
      get() {
        const amount = Number(this.order.amount)

        return amount > 0 ? amount : null
      },
      set(amount) {
        this.order.amount = Number(amount)
      }
    },
    price: {
      get() {
        const price = Number(this.order.price)

        return price > 0 ? price : null
      },
      set(price) {
        this.order.price = Number(price)
      }
    },
    qty: {
      get() {
        const qty = Number(this.order.qty)

        return qty > 0 ? qty : null
      },
      set(qty) {
        this.order.qty = Number(qty)
      }
    }
  },
  methods: {
    expand({ target })
    {
      target.closest('.dropdown').lastElementChild?.classList.toggle('dropdown-menu--expanded')
    },
    beforeSend(key = 'submit')
    {
      this.onChange({
        action: '(отправка на сервер)',
        extend: `
          <pre>send: ${stringify(this.order)}</pre><br>
          <pre>local: ${this.storage}</pre>
        `,
        key
      })
    },
    afterSend(success, key = 'response')
    {
      this.onChange({
        action: '(ответ сервера)',
        extend: `
          <pre>response: ${JSON.stringify({ success }, null, 2)}</pre><br>
          <pre>local: ${this.storage}</pre>
        `,
        key
      })
    },
    async send()
    {
      this.beforeSend()

      const { success } = await sendRequest(this.order)

      if (success) {
        this.storage = stringify(this.order)
        localStorage.setItem('order', this.storage)
      }

      this.afterSend(success)
    },
    onChange: debounce(function({ extend, key = '', action = 'было изменено' }) {
      let old, now, str = '', nonce = this.order.nonce += 1

      if (!['submit','response'].includes(key)) {
        old = this[key]
        this.flush(this.buffer[key])
        now = this[key]
      }

      str += old ? `${old} >>> ` : ''
      str += now ? `${now}` : ''

      this.events.unshift({
        desc: cutSpaces(`${nonce} ${key} ${action} ${str}`),
        extend,
        key
      })
    }),
    onInput: debounce(function({ target }, key) {
      this.buffer[key] = +target.value
      this.archiver.nowChange = key
    }),
    flush(changed)
    {
      let first, last, now, field, amount, price, qty, value

      first = this.archiver.firstChanged
      last = this.archiver.lastChanged
      now = this.archiver.nowChange

      field = this.byFirst ? first : last

      value = this[field]
      amount = this.amount
      price = this.price
      qty = this.qty

      switch (now) {
        case 'amount':
          switch (field) {
            case 'qty':
              price ??= changed / qty
              price && (value = changed / price)
              break
            case 'price':
              qty ??= changed / price
              qty && (value = changed / qty)
              break
          }
          break
        case 'price':
          switch (field) {
            case 'qty':
              amount ??= changed * qty
              amount && (value = amount / changed)
              break
            case 'amount':
              qty ??= amount / changed
              qty && (value = qty * changed)
              break
          }
          break
        case 'qty':
          switch (field) {
            case 'price':
              amount ??= price * changed
              amount && (value = amount / changed)
              break
            case 'amount':
              price ??= amount / changed
              price && (value = price * changed)
              break
          }
      }

      if (value >= Infinity) {
        value = 0
      }

      Object.assign(
        this.order,
        { amount, price, qty },
        {
          [field]: value,
          [now]: changed
        }
      )
    }
  },
  beforeMount()
  {
    if (!localStorage.getItem('order')) {
      localStorage.setItem('order', stringify(this.order))
    }

    this.storage = localStorage.getItem('order')
  },
  async mounted()
  {
    await this.$nextTick()

    for (const ref in this.$refs) {
      this.validators.push(
        new RuntimeValidator(
          this.$refs[ref],
          [{
            id: ref,
            message: 'Not a Number',
            validator: target => {
              if (Number.isNaN(Number(target.value))) {
                target.value = target.value.toString().slice(0, target.value.length - 1)
                return false
              }

              return true
            }
          }]
        )
      )
    }
  }
}
</script>

<style scoped lang="scss">
.container .row {
  justify-content: space-around;
  align-items: center;

  ::v-deep(pre) {
    margin: 0;
  }

  label {
    display: block;
  }
  sub {
    display: block;
    margin-left: 10px;

    line-height: unset;
    font-size: .5em;
    color: #6c757d;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ::v-deep(.vue-switcher) {
    display: flex;
    width: 220px;
    justify-content: flex-end;
    align-items: center;

    .vue-switcher__label {
      margin: 0 10px 2px 0;
      font-size: .9em;
      display: block;
    }
  }

  .bi-caret-down-fill {
    font-size: 10px;
    margin: 0 10px;
  }
  .col-3 {
    width: 130px;
    margin: 5px auto;
    font-size: 20px;
    flex-grow: 1;
    flex-shrink: 0;
    order: 0;

    &:last-child {
      flex-grow: 0;
      flex-shrink: 1;
      align-self: flex-start;
    }
  }
  .card {
    .list-group {
      max-height: 490px;
      min-height: 204px;
      overflow: scroll;

      .list-group-item-action {
        cursor: pointer;
      }
    }
  }
  .dropdown-menu {
    position: relative;
    display: block;
    border: none;

    overflow: hidden;

    padding: 0 5px 0 35px;
    max-height: 0;

    background: transparent;

    &--expanded {
      padding: 10px 5px 10px 35px;
      max-height: fit-content;
    }
  }
}
</style>
