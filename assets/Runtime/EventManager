import Singleton from "../Base/Singleton"

interface IItem{
  func:Function
  ctx:any
}

export default class EventManager extends Singleton {

  static get Instance(){
    return super.getInstance<EventManager>()
  }

  private eventDic:Map<string,Array<IItem>> = new Map()

  on(eventName:string,func:Function,ctx:any){
    if (this.eventDic.has(eventName)) {
      this.eventDic.get(eventName)?.push({func,ctx})
    }else{
      this.eventDic.set(eventName,[{func,ctx}])
    }
  }

  off(eventName:string,func:Function){
    if (this.eventDic.has(eventName)) {
      const callbacks = this.eventDic.get(eventName)
      if (callbacks) {
        const index = callbacks.findIndex(item=>item.func === func)
        if (index !== -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  emit(eventName:string,...args:any[]){
    if (this.eventDic.has(eventName)) {
      const callbacks = this.eventDic.get(eventName)
      if (callbacks) {
        callbacks.forEach(({func, ctx}) => {
          ctx?func.apply(ctx,args): func(...args)
        })
      }
    }
  }

  clear(){
    this.eventDic.clear()
  }
}
