import { CommonModule } from "@angular/common";
import { SidebarEquipoComponent } from "../sidebar-equipo/sidebar-equipo.component";
import { HeaderComponent } from "../header/header.component";
import { ActivatedRoute } from "@angular/router";
import { EquipoService } from "../../services/equipos.service";
import { Component, OnInit } from "@angular/core";

@Component({
    selector: 'app-plantilla',
    standalone: true,
    imports: [CommonModule, HeaderComponent, SidebarEquipoComponent],
    templateUrl: './plantilla.component.html',
    styleUrls: ['./plantilla.component.scss']
  })
  export class PlantillaComponent implements OnInit {
  
    equipoId!: number;
    equipo: any;
  
    constructor(
      private route: ActivatedRoute,
      private equipoService: EquipoService
    ) {}
  
    ngOnInit() {
      this.equipoId = Number(this.route.snapshot.paramMap.get('id'));
      this.equipoService.getEquipoById(this.equipoId)
        .subscribe(e => this.equipo = e);
    }
  }
  