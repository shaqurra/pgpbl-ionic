import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as L from 'leaflet';
import { DataService } from '../data.service';


const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})
export class MapsPage implements OnInit {

  map!: L.Map;

  private dataService = inject(DataService);

  constructor(private router: Router, private alertController: AlertController) { }

  goToCreatePoint() {
    this.router.navigate(['/createpoint']);
  }

  goToEditPoint(id: string) {
    this.router.navigate(['/createpoint', id]);
  }

  async loadPoints() {
    const points: any = await this.dataService.getPoints();
    for (const key in points) {
      if (points.hasOwnProperty(key)) {
        const point = points[key];
        const coordinates = point.coordinates.split(',').map((c: string) => parseFloat(c));
        const marker = L.marker(coordinates as
          L.LatLngExpression).addTo(this.map);
        marker.bindPopup(`${point.name}<br><ion-icon name="create-outline" style="color: orange; cursor: pointer;" class="edit-btn" data-id="${key}"></ion-icon> <ion-icon name="trash-outline" style="color: red; cursor: pointer;" class="delete-btn" data-id="${key}"></ion-icon>`);
      }
    }

    this.map.on('popupopen', (e) => {
      const popup = e.popup;
      const deleteBtn = popup.getElement()?.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (event: any) => {
          const id = event.target.getAttribute('data-id');
          this.confirmDelete(id);
        });
      }

      const editBtn = popup.getElement()?.querySelector('.edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', (event: any) => {
          const id = event.target.getAttribute('data-id');
          this.goToEditPoint(id);
        });
      }
    });
  }

  async confirmDelete(id: string) {
    const alert = await this.alertController.create({
      header: 'Konfirmasi',
      message: 'Apakah Anda yakin ingin menghapus titik ini?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Hapus',
          handler: () => {
            this.deletePoint(id);
          }
        }
      ]
    });

    await alert.present();
  }

  async deletePoint(id: string) {
    await this.dataService.deletePoint(id);
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });
    this.loadPoints();
    this.map.closePopup();
  }


  ngOnInit() {
    if (!this.map) {
      setTimeout(() => {
        this.map = L.map('map').setView([-7.7956, 110.3695], 13);


        var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        });


        osm.addTo(this.map);

        osm.addTo(this.map);

        //load point from firebase
        this.loadPoints();
      });
    }

  }

}