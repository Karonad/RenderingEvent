import { Component } from '@angular/core';
import data from '../assets/data/input.json';
import { Event } from './event';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  eventArray: Event[];
  displayArray: {
    id: number
    start: string
    duration: number
    index: number
    concurrentIds: number[]
    width: number
    concurrentColumns: number
  }[] = [];

  constructor() {
    this.eventArray = data;
    this.eventArray.sort((a, b) => a.start.localeCompare(b.start));
    this.displayEvents();
  }

  // find if the event is concurrent with other events
  concurringEvents(givenEvent: Event): {
    index: number
    concurringIds: number[]
  } {
    const concurrentIds = [];
    let index = 0;
    const givenStartTime = this.parseStartTime(givenEvent.start);
    const givenEndTime = givenStartTime + givenEvent.duration;

    // loop through all events
    for (let event of this.eventArray) {
      const eventStartTime = this.parseStartTime(event.start);
      const eventEndTime = eventStartTime + event.duration;
      // check if the given event has a conflict with another event
      if (event.id != givenEvent.id && givenStartTime < eventEndTime && givenEndTime > eventStartTime) {
        // check if the event is concurrent with another event and increment the index if true
        if (this.displayArray.find(e => e.id === event.id)) {
          index = this.displayArray.find(e => e.id === event.id)!.index + 1
        }
        concurrentIds.push(event.id);
      }

    }
    return {
      index: index,
      concurringIds: concurrentIds
    };
  }

  // display the events depending on the concurrent events
  displayEvents() {
    this.displayArray = [];
    // loop through all events
    for (let event of this.eventArray) {
      const concurring = this.concurringEvents(event);
      this.displayArray.push({
        id: event.id,
        start: event.start,
        duration: event.duration,
        index: concurring.index,
        concurrentIds: concurring.concurringIds,
        width: 100,
        concurrentColumns: concurring.concurringIds.length
      });
    }
    // bind the index of each event depending on the concurrent events
    for (let i = 0; i < this.displayArray.length; i++) {
      const index = this.getIndex(this.displayArray[i].concurrentIds);
      this.displayArray[i].index = index
    }
    // bind the width and the concurrent columns of each event depending on the number of concurrent events
    for (let i = 0; i < this.displayArray.length; i++) {
      const element = this.getWidth({ index: this.displayArray[i].index, concurringIds: this.displayArray[i].concurrentIds });
      this.displayArray[i].width = element.width;
      this.displayArray[i].concurrentColumns = element.concurrentColumns;
    }
  }

  // get the index of the event depending on the concurrent events
  getIndex(concurringIds: number[]): number {
    let index = 0;
    let indexArray: number[] = this.getIndexArray(concurringIds);
    indexArray.sort((a, b) => a - b);
    // bind index to minimal value if not in the index array
    for (let i = 0; i <= indexArray.length; i++) {
      if (i != indexArray[i]) {
        index = i;
        break;
      }
    }
    return index
  }

  // bind to index array depending on the concurrent events
  getIndexArray(concurringIds: number[]): number[] {
    let indexArray: number[] = [];
    for (let i = 0; i < concurringIds.length; i++) {
      const element = this.displayArray.find(e => e.id === concurringIds[i])!.index
      if (indexArray.indexOf(element) === -1) {
        indexArray.push(element);
      }
    }
    return indexArray;
  }

  // get the width of the event depending on the number of concurrent events
  getWidth(concurring: { index: any; concurringIds: number[]; }): {
    width: number;
    concurrentColumns: number;
  } {
    let indexArray: number[] = this.getIndexArray(concurring.concurringIds);
    // if our index array is empty, we return max width
    if (indexArray.length === 0) return {
      width: 100,
      concurrentColumns: 0
    };
    // return the width of the event depending on the number of concurrent events
    return {
      width: 100 / (indexArray.length + 1),
      concurrentColumns: indexArray.length
    }
  }


  // parse the start time to minute
  parseStartTime(startTime: string): number {
    let minutes = 0;
    minutes += parseInt(startTime.split(":")[0]) * 60;
    minutes += parseInt(startTime.split(":")[1]);
    return minutes;
  }

  parseEndTime(startTime: string, duration: number): string {
    let minutes = this.parseStartTime(startTime);
    minutes += duration;
    let hours = Math.floor(minutes / 60);
    let minutesLeft = minutes % 60;
    if (minutesLeft < 10) {
      return `${hours}:0${minutesLeft}`;
    }
    return `${hours}:${minutesLeft}`;
  }
}
