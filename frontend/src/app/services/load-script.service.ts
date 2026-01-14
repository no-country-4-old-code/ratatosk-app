import {Injectable} from '@angular/core';

export type LoadableScriptName = 'gcapture';

interface ScriptMetaData {
  src: string;
  isLoaded: boolean;
}

type LookupScriptMetaData = {[name in LoadableScriptName]: ScriptMetaData}

export interface StatusScriptLoad {
  name: LoadableScriptName,
  isLoaded: boolean,
  msg: string
}

@Injectable({
  providedIn: 'root'
})
export class LoadScriptService {
  private readonly lookupScript: LookupScriptMetaData;

  constructor() {
    this.lookupScript = {
      'gcapture': {isLoaded: false, src: "https://www.recaptcha.net/recaptcha/api.js?render=6Le2s_kbAAAAAITo6mtfPWykKJ4W6Cb99fQH7GyX"}
    };
  }

  loadScript(name: LoadableScriptName): Promise<StatusScriptLoad> {
    return new Promise((resolve, reject) => {
      if (this.lookupScript[name].isLoaded) {
        resolve({name, isLoaded: true, msg: 'Already Loaded'});
      }
      else {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.lookupScript[name].src;
        script.onload = () => {
          this.lookupScript[name].isLoaded = true;
          resolve({name, isLoaded: true, msg: 'Loaded'});
        };
        script.onerror = (error: any) => resolve({name, isLoaded: false, msg: error.message});
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }
}
