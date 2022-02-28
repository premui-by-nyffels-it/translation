import { Subject } from 'rxjs';
import { TranslationItem } from '../interfaces/translation-item.interface';
import * as _ from 'lodash';

export class Translation {
  private _data: TranslationItem[];

  private _selectedIso: string;
  public set language(iso: string) {
    this._selectedIso = iso != null && iso.trim() != '' ? iso : this._defaultIso;
    this.languageChanged.next(this._selectedIso);
  }
  public get language(): string {
    return this._selectedIso;
  }

  private _defaultIso: string;
	public set defaultIso(iso: string) {
		this._defaultIso = iso;
	}

  public languageChanged: Subject<string> = new Subject<string>();

  constructor(data: TranslationItem[] = [], iso: string = null) {
    this._data = data;
    this._defaultIso = 'en';
    this._selectedIso = iso ? iso : this._defaultIso;
  }

  public loadData(data: TranslationItem[], append = false): void {
    if (!!append) {
      this._data.concat(data);
    } else {
      this._data = _.cloneDeep(data);
    }
  }

  public getValueByKey(key: string, params: string[] = []): string {
    if (key === null || key === undefined) return '';
    if (params === undefined || params === null) params = [];

    if (this._selectedIso) {
      /* Get the translationstring */
      let item: TranslationItem = this._data.find((x) => x.key == key);
      if (item == null) return key;
      let translationString = item.values.find((x) => x.iso == this._selectedIso)?.value;

      /* Replace translationString parameters by the given parameters */
      for (let i: number = 0; i < params.length; i++) {
        const regex = new RegExp(`{\\{${i}}}`, 'g');
        translationString = translationString.replace(regex, params[i]);
      }

      /* Return the translated string */
      return translationString;
    } else {
      /* Set language and redo the get */
			this.language = this._defaultIso;
      return this.getValueByKey(key);
    }
  }

  public getKeyByValue(value: string, preKeyFilter: string = null): string[] {
    if (value === null) return [];

    if (this._selectedIso) {
      let items: TranslationItem[] = this._data
        .filter((item) => {
          if (preKeyFilter == null) {
            return true;
          } else {
            return item.key.includes(preKeyFilter);
          }
        })
        .filter((item) =>
          item.values
            .find((val) => val.iso === this._selectedIso)
            .value?.toLowerCase()
            .includes(value.replace(/%/g, ''))
        );
      return items.map((item) => item.key);
    } else {
      /* Set language and redo the get */
			this.language = this._defaultIso;
      return this.getKeyByValue(value);
    }
  }
}
