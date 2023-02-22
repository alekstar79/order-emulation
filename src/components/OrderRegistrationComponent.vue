<template>
  <div class="container">
    <section class="row">
      <div class="col-12">
        <nav class="navbar navbar-light bg-light">
          <div class="container-fluid">
            <span class="navbar-brand">Эмулятор заказа</span>
          </div>
        </nav>
      </div>
    </section>

    <section class="row my-3">
      <div class="col-3">
        <input
          :value="price"
          @change="onChange($event, 'price')"
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
          @change="onChange($event, 'qty')"
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
          @change="onChange($event, 'amount')"
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
        <button @click="send" class="btn btn-outline-secondary">
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
import { sendRequest, stringify, debounce } from '@/utils/common'
import { RuntimeValidator } from '@/utils/validator'

export default {
  name: 'OrderRegistrationComponent',

  data: () => ({
    validators: [],
    events: [],

    storage: {},

    order: {
      nonce: 0,
      price: 0,
      qty: 0,
      amount: 0
    }
  }),
  computed: {
    representation()
    {
      return `<pre>${stringify(this.storage)}</pre>`
    },
    amount: {
      get() {
        Object.assign(this.order, { amount: this.order.price * this.order.qty })

        const { amount } = this.order

        return Number(amount) > 0 ? amount : null
      },
      set(amount) {
        this.order.amount = amount
      }
    },
    price: {
      get() {
        const { price } = this.order

        return Number(price) > 0 ? price : null
      },
      set(price) {
        this.order.price = price
      }
    },
    qty: {
      get() {
        const { qty } = this.order

        return Number(qty) > 0 ? qty : null
      },
      set(qty) {
        this.order.qty = qty
      }
    }
  },
  methods: {
    expand({ target })
    {
      target.closest('.dropdown').lastElementChild?.classList.toggle('dropdown-menu--expanded')
    },
    beforeSend()
    {
      this.onChange({
        extend: `
          <pre>send: ${stringify(this.order)}</pre><br>
          <pre>local: ${stringify(this.storage)}</pre>
        `
      }, 'submit', 'отправка на сервер')
    },
    afterSend(success)
    {
      this.onChange({
        extend: `
          <pre>response: ${JSON.stringify({ success }, null, 2)}</pre><br>
          <pre>local: ${stringify(this.storage)}</pre>
        `
      }, 'response', 'ответ сервера')
    },
    async send()
    {
      this.beforeSend()

      const { success } = await sendRequest(stringify(this.order))

      if (success) {
        window.localStorage.setItem('order', stringify(this.order))
        this.storage = Object.assign({}, this.order)
      }

      this.afterSend(success)
    },
    onChange: debounce(function({ target, extend }, key, action = 'было изменено') {
      this.order.nonce += 1

      this.events.unshift({
        key, desc: `${this.order.nonce} ${key} ${action} ${target?.value || ''}`, extend
      })
    }),
    onInput: debounce(function({ target }, key) {
      this[key] = target.value
    })
  },
  beforeMount()
  {
    if (!window.localStorage.getItem('order')) {
      window.localStorage.setItem('order', stringify(this.order))
    }

    this.storage = JSON.parse(window.localStorage.getItem('order'))
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
            validator: (target, key) => {
              if (Number.isNaN(Number(target.value))) {
                target.value = target.value.toString().slice(0, target.value.length - 1)
                this.onInput({ target }, key)
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
