import { Component, inject } from '@angular/core';
import { NavController, AlertController, IonicModule } from '@ionic/angular';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class RegisterPage {

  email = '';
  password = '';
  confirmPassword = '';

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private authService = inject(AuthService);

  async register() {
    if (this.password === this.confirmPassword && this.email && this.password) {
      try {
        await this.authService.register(this.email, this.password);
        this.navCtrl.navigateBack('/login');
      } catch (error: any) {
        const alert = await this.alertCtrl.create({
          header: 'Registration Failed',
          message: error.message,
          buttons: ['OK'],
        });
        await alert.present();
      }
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Registration Failed',
        message: 'Passwords do not match.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

}
