// noinspection JSUnusedGlobalSymbols

import { Emitter } from './emitter.js'

/**
* @class RuntimeValidator Form validator
* @constructor
*
* @property {HTMLInputElement} input
* @property {Array<{id: String, validator: (Function|RegExp), message: ?String}>} rules
* @property {Array<{id: String, message: ?String}>} errors
*/
export class RuntimeValidator extends Emitter
{
  static SUCCESS = 'success'
  static ERROR = 'error'

  static ON_CHANGE = 2
  static ON_ENTRY = 1
  static ON_BLUR = 0

  /**
  * @param {HTMLInputElement} input
  * @param {Array<{id: String, validator: (Function|RegExp), message: ?String}>} rules
  * @param {?Number} [validateOn]
  */
  constructor(input, rules, validateOn = null)
  {
    super()

    this.bind()

    this.input = input
    this.rules = rules
    this.errors = []

    validateOn ??= RuntimeValidator.ON_ENTRY

    switch (validateOn) {
      case RuntimeValidator.ON_CHANGE:
        this.validateOnChange()
        break
      case RuntimeValidator.ON_ENTRY:
        this.validateOnEntry()
        break
      case RuntimeValidator.ON_BLUR:
        this.validateOnBlur()
        break
    }
  }

  bind()
  {
    this.validate = this.validate.bind(this)
  }

  validateOnChange()
  {
    this.input.addEventListener('change', this.validate)
  }

  validateOnEntry()
  {
    this.input.addEventListener('input', this.validate)
  }

  validateOnBlur()
  {
    this.input.addEventListener('blur', this.validate)
  }

  validate()
  {
    this.rules.forEach(({ id, validator, message }) => {
      switch (true) {
        case validator instanceof Function:
          if (!validator.call(this.input, this.input, id)) {
            this.errors.push({ id, value: this.input.value, message })

            this.emit.call(
              this,
              RuntimeValidator.ERROR,
              this.errors
            )
          }
          break

        case validator instanceof RegExp:
          if (!validator.test(this.input.value)) {
            this.errors.push({ id, value: this.input.value, message })

            this.emit.call(
              this,
              RuntimeValidator.ERROR,
              this.errors
            )
          }
      }
    })
  }
}

/**
* @class ValidatorRuntimeError
*/
export class RuntimeValidatorError extends Error {}
