import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EventDetailsModalComponent } from '../../modals/event-details-modal/event-details-modal.component';

@Component({
  selector: 'app-mini-calendario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mini-calendar.component.html',
  styleUrls: ['./mini-calendar.component.scss'],
})
export class MiniCalendarComponent implements OnInit, OnChanges {
  @Input() events: any[] = [];
  @Input() matchCalls: any[] = [];
  @Input() teamId!: number;

  weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  days: any[] = [];

  monthName = '';
  year!: number;

  constructor(
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.generateCalendar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['events'] || changes['matchCalls']) {
      this.generateCalendar();
    }
  }

  sameDate(date1: string | Date, date2: Date): boolean {
    const d1 = new Date(date1);
    return (
      d1.getDate() === date2.getDate() &&
      d1.getMonth() === date2.getMonth() &&
      d1.getFullYear() === date2.getFullYear()
    );
  }

  goToCalendar() {
    this.router.navigate(['/equipo', this.teamId, 'calendario']);
  }

  generateCalendar() {
    this.days = [];

    const today = new Date();
    const month = today.getMonth();
    this.year = today.getFullYear();
    this.monthName = today.toLocaleString('es', { month: 'long' });

    const lastDay = new Date(this.year, month + 1, 0).getDate();
    let firstWeekDay = new Date(this.year, month, 1).getDay();
    firstWeekDay = firstWeekDay === 0 ? 6 : firstWeekDay - 1;

    for (let i = 0; i < firstWeekDay; i++) {
      this.days.push({ number: null, empty: true });
    }
    for (let i = 1; i <= lastDay; i++) {
      const date = new Date(this.year, month, i);

      const dayEvents = this.events.filter((e) => this.sameDate(e.fecha_inicio, date));

      const dayMatchCalls = this.matchCalls.filter((c) => this.sameDate(c.fecha_partido, date));

      let type: string | null = null;
      let id: number | null = null;
      let isMatchCall = false;

      if (dayMatchCalls.length > 0) {
        type = 'partido';
        id = dayMatchCalls[0].id;
        isMatchCall = true;
      } else if (dayEvents.length > 0) {
        const event = dayEvents[0];
        id = event.id;

        switch (event.tipo) {
          case 'entrenamiento':
            type = 'entrenamiento';
            break;
          case 'reunion':
            type = 'reunion';
            break;
          case 'partido':
            type = 'partido';
            break;
          default:
            type = 'otro';
        }
      }

      this.days.push({
        number: i,
        isToday:
          i === today.getDate() && month === today.getMonth() && this.year === today.getFullYear(),
        type,
        id,
        isMatchCall,
        hasEvent: !!id,
      });
    }
  }

  openDayDetail(event: MouseEvent, day: any) {
    event.stopPropagation();

    if (!day.hasEvent) return;

    this.dialog.open(EventDetailsModalComponent, {
      width: '500px',
      data: {
        id: day.id,
        tipo: day.isMatchCall ? 'convocatoria' : 'evento',
        equipoId: this.teamId,
      },
    });
  }
}
