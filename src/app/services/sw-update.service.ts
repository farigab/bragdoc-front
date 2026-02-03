import { ApplicationRef, inject, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { concat, filter, first, interval } from 'rxjs';
import { LoggingService } from './logging.service';

@Injectable({ providedIn: 'root' })
export class SwUpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly appRef = inject(ApplicationRef);
  private readonly logger = inject(LoggingService);

  init(): void {
    if (!this.swUpdate.isEnabled) {
      this.logger.info('Service Worker não está habilitado');
      return;
    }

    // Verifica atualizações quando o app estabiliza
    const appIsStable$ = this.appRef.isStable.pipe(
      first(isStable => isStable === true)
    );

    // Verifica a cada 6 horas
    const everySixHours$ = interval(6 * 60 * 60 * 1000);

    concat(appIsStable$, everySixHours$).subscribe(() => {
      this.checkForUpdates();
    });

    // Escuta por novas versões disponíveis
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      )
      .subscribe(evt => {
        this.logger.info('Nova versão disponível', {
          current: evt.currentVersion,
          latest: evt.latestVersion
        });

        // Recarrega automaticamente para aplicar a atualização
        if (confirm('Nova versão disponível! Recarregar agora?')) {
          this.activateUpdate();
        }
      });

    // Detecta versões não recuperáveis
    this.swUpdate.unrecoverable.subscribe(event => {
      this.logger.error('Service Worker em estado não recuperável', { event });
      
      if (confirm(
        'A aplicação precisa ser recarregada devido a um erro. Recarregar agora?'
      )) {
        window.location.reload();
      }
    });
  }

  private checkForUpdates(): void {
    this.swUpdate
      .checkForUpdate()
      .then(updateFound => {
        if (updateFound) {
          this.logger.info('Atualização encontrada durante verificação');
        }
      })
      .catch(err => {
        this.logger.error('Erro ao verificar atualizações', { err });
      });
  }

  private activateUpdate(): void {
    this.swUpdate
      .activateUpdate()
      .then(() => {
        this.logger.info('Atualização ativada, recarregando...');
        window.location.reload();
      })
      .catch(err => {
        this.logger.error('Erro ao ativar atualização', { err });
      });
  }
}
