/**
* @class Emitter
* @constructor
* @property {Object} events
*/
export class Emitter
{
  constructor()
  {
    this.events = {}
  }

  /**
  * @param {String} id
  * @param {Function} fn
  */
  on(id, fn)
  {
    (this.events[id] = this.events[id] || []).push(fn)
  }

  /**
  * @param {String} id
  * @param {[*]} data
  */
  emit(id, ...data)
  {
    (this.events[id] || []).forEach(fn => fn(...data))
  }
}
