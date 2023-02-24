/**
* @class Archiver
*/
export class Archiver
{
  /**
  * @type {String[]}
  */
  static dump = []

  /**
  * @type {String}
  */
  static _tmp

  /**
  * @returns {Archiver}
  */
  static init()
  {
    return new Archiver()
  }

  constructor(value = null)
  {
    Archiver._tmp = this.value = value
  }

  /**
  * @param {String} v
  */
  set nowChange(v)
  {
    let last

    if (Archiver._tmp !== v) {
      Archiver._tmp = v

      last = Archiver.dump.length
        ? Archiver.dump[Archiver.dump.length - 1]
        : null

      if (last && last !== v) {
        this.value = last
      }

      if (!last || last !== v) {
        Archiver.dump.push(v)
      }
    }
  }

  /**
  * @returns {String}
  */
  get nowChange()
  {
    return Archiver._tmp
  }

  /**
  * @returns {String}
  */
  get firstChanged()
  {
    return Archiver.dump[0]
  }

  /**
  * @returns {String|null}
  */
  get lastChanged()
  {
    return this.value
  }
}
