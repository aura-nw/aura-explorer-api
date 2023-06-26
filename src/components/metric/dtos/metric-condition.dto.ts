import { TypeDate } from '../utils/enum';

export class MetricConditionDto {
  fluxType: string;
  formatDate: string;
  amount: number;
  step = 1;
  type: TypeDate;
}
