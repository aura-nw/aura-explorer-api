import { MetricConditionDto } from '../dtos/metric-condition.dto';
import { MetricOutput } from '../dtos/metric-output.dto';
import { Range, TypeDate } from './enum';

const makeData = (date: Date): MetricOutput => {
  const data = new MetricOutput();
  data.count = '0';
  data.timestamp = date.toISOString().split('.')[0]+"Z";
  return data;
};

export function generateSeries(range: Range): MetricOutput[] {
  const series: MetricOutput[] = [];
  const now = new Date();
  const past = new Date(now);
  const condition = buildCondition(range);
  switch (condition.type) {
    case TypeDate.month: {
      past.setMonth(now.getMonth() - condition.amount);
      for (
        let date = new Date(new Date(past).setUTCHours(0, 0, 0, 0));
        date <= now;
        date.setMonth(date.getMonth() + condition.step)
      ) {
        date.setUTCDate(1);
        series.push(makeData(date));
      }
      break;
    }
    case TypeDate.day: {
      past.setDate(now.getDate() - condition.amount);
      for (
        let date = new Date(new Date(past).setUTCHours(0, 0, 0, 0));
        date <= now;
        date.setDate(date.getDate() + condition.step)
      ) {
        series.push(makeData(date));
      }
      break;
    }
    case TypeDate.hour: {
      past.setHours(now.getHours() - condition.amount);
      for (
        let date = new Date(new Date(past).setUTCMinutes(0, 0, 0));
        date <= now;
        date.setHours(date.getHours() + condition.step)
      ) {
        series.push(makeData(date));
      }
      break;
    }
    case TypeDate.minute: {
      past.setMinutes(now.getMinutes() - condition.amount);
      for (
        let date = new Date(new Date(past).setUTCSeconds(0, 0));
        date <= now;
        date.setMinutes(date.getMinutes() + condition.step)
      ) {
        series.push(makeData(date));
      }
      break;
    }
  }

  return series;
}

export function mergeByProperty(
  metric: MetricOutput[],
  series: MetricOutput[],
): MetricOutput[] {
  return series.map((seriesElement) => {
    return (
      metric.find((e) => {
        return seriesElement.timestamp === e.timestamp;
      }) || seriesElement
    );
    // sourceElement = targetElement || sourceElement;
    // return sourceElement;
  });
}

export function buildCondition(range: Range): MetricConditionDto {
  const condition = new MetricConditionDto();
  switch (range) {
    case Range.month:
      condition.formatDate = '%Y-%m-01T00:00:00.000Z';
      condition.amount = 12;
      condition.step = 1;
      condition.type = TypeDate.month;
      condition.fluxType = 'mo'
      break;
    case Range.day:
      condition.formatDate = '%Y-%m-%dT00:00:00.000Z';
      condition.amount = 30;
      condition.step = 1;
      condition.type = TypeDate.day;
      condition.fluxType = 'd'
      break;
    case Range.minute:
      condition.formatDate = '%Y-%m-%dT%H:%i:00.000Z';
      condition.amount = 60;
      condition.step = 1;
      condition.type = TypeDate.minute;
      condition.fluxType = 'm'
      break;
    case Range.hour:
    default:
      condition.formatDate = '%Y-%m-%dT%H:00:00.000Z';
      condition.amount = 24;
      condition.step = 1;
      condition.type = TypeDate.hour;
      condition.fluxType = 'h'
      break;
  }
  return condition;
}
