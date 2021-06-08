import { DynamicModule, Injectable, Type } from '@nestjs/common';
import { LanguageCode } from '@vendure/common/lib/generated-types';
import { ConnectionOptions } from 'typeorm';

import { getConfig } from './config-helpers';
import { CustomFields } from './custom-field/custom-field-types';
import { EntityIdStrategy } from './entity-id-strategy/entity-id-strategy';
import { Logger, VendureLogger } from './logger/vendure-logger';
import {
    ApiOptions,
    AssetOptions,
    AuthOptions,
    CatalogOptions,
    ImportExportOptions,
    JobQueueOptions,
    OrderOptions,
    PaymentOptions,
    PromotionOptions,
    RuntimeVendureConfig,
    ShippingOptions,
    TaxOptions,
    VendureConfig,
} from './vendure-config';

@Injectable()
export class ConfigService implements VendureConfig {
    private activeConfig: RuntimeVendureConfig;

    constructor() {
        this.activeConfig = getConfig();
        if (this.activeConfig.authOptions.disableAuth) {
            // tslint:disable-next-line
            Logger.warn('Auth has been disabled. This should never be the case for a production system!');
        }
    }

    get apiOptions(): Required<ApiOptions> {
        return this.activeConfig.apiOptions;
    }

    get authOptions(): Required<AuthOptions> {
        return this.activeConfig.authOptions;
    }

    get catalogOptions(): Required<CatalogOptions> {
        return this.activeConfig.catalogOptions;
    }

    get defaultChannelToken(): string | null {
        return this.activeConfig.defaultChannelToken;
    }

    get defaultLanguageCode(): LanguageCode {
        return this.activeConfig.defaultLanguageCode;
    }

    get entityIdStrategy(): EntityIdStrategy<any> {
        return this.activeConfig.entityIdStrategy;
    }

    get assetOptions(): Required<AssetOptions> {
        return this.activeConfig.assetOptions;
    }

    get dbConnectionOptions(): ConnectionOptions {
        return this.activeConfig.dbConnectionOptions;
    }

    get promotionOptions(): Required<PromotionOptions> {
        return this.activeConfig.promotionOptions;
    }

    get shippingOptions(): Required<ShippingOptions> {
        return this.activeConfig.shippingOptions;
    }

    get orderOptions(): Required<OrderOptions> {
        return this.activeConfig.orderOptions as Required<OrderOptions>;
    }

    get paymentOptions(): Required<PaymentOptions> {
        return this.activeConfig.paymentOptions as Required<PaymentOptions>;
    }

    get taxOptions(): Required<TaxOptions> {
        return this.activeConfig.taxOptions;
    }

    get importExportOptions(): Required<ImportExportOptions> {
        return this.activeConfig.importExportOptions;
    }

    get customFields(): Required<CustomFields> {
        return this.activeConfig.customFields;
    }

    get plugins(): Array<DynamicModule | Type<any>> {
        return this.activeConfig.plugins;
    }

    get logger(): VendureLogger {
        return this.activeConfig.logger;
    }

    get jobQueueOptions(): Required<JobQueueOptions> {
        return this.activeConfig.jobQueueOptions;
    }
}

export class configSMS {
    constructor(){
    }
    //config send sms Telesing
    telesign_customerId:"CAD146AC-8606-4D1C-8BBB-9C74DCA2C429";
    telesign_apiKey:"wekQphrwNZb9RJL4t5cln+g/pn4k0mmNoKdPr/bYAqxkHjMKX8abVSxps26fk5IKPmOO9UK6HwPKYlN71Nykrw==";
    telesign_rest_endpoint:"https://rest-api.telesign.com";
    telesign_timeout:10000;
    telesign_messageType:"ARN";
}


export class configMail{
    constructor(){}
    smtp:{
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports eg 587
        auth: {
            user: 'marino.oniriquefactory@gmail.com', // generated ethereal user
            pass: '568OUYtvf*', // generated ethereal password
        }
    }
}