/* tslint:disable:no-console */
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { ADMIN_API_PATH, API_PORT, SHOP_API_PATH } from '@vendure/common/lib/shared-constants';
import {
    Address,
    Asset,
    DefaultJobQueuePlugin,
    DefaultLogger,
    defaultPromotionActions,
    DefaultSearchPlugin,
    dummyPaymentHandler,
    examplePaymentHandler,
    FulfillmentHandler,
    LanguageCode,
    LogLevel,
    manualFulfillmentHandler,
    PaymentMethodEligibilityChecker,
    PromotionItemAction,
    VendureConfig,
} from '@vendure/core';
import { ElasticsearchPlugin } from '@vendure/elasticsearch-plugin';
import { defaultEmailHandlers, EmailPlugin } from '@vendure/email-plugin';
import path from 'path';
import { ConnectionOptions } from 'typeorm';

const testPaymentChecker = new PaymentMethodEligibilityChecker({
    code: 'test-checker',
    description: [{ languageCode: LanguageCode.en, value: 'test checker' }],
    args: {},
    check: (ctx, order) => true,
});

const testPromoAction = new PromotionItemAction({
    code: 'discount-price-action',
    description: [{ languageCode: LanguageCode.en, value: 'Apply discount price' }],
    args: {},
    execute: (ctx, orderItem, orderLine) => {
        if ((orderLine.productVariant.customFields as any).discountPrice) {
            return -(
                orderLine.unitPriceWithTax - (orderLine.productVariant.customFields as any).discountPrice
            );
        }
        return 0;
    },
});

const myHandler = new FulfillmentHandler({
    code: 'test-handler',
    args: {},
    description: [{ languageCode: LanguageCode.en, value: 'test fulfillment handler' }],
    createFulfillment: ctx => {
        return {
            method: 'test-handler',
            trackingCode: '123123123123',
            customFields: {
                logoId: 1,
            },
        };
    },
});

/**
 * Config settings used during development
 */
export const devConfig: VendureConfig = {
    apiOptions: {
        port: API_PORT,
        adminApiPath: ADMIN_API_PATH,
        adminApiPlayground: {
            settings: {
                'request.credentials': 'include',
            } as any,
        },
        adminApiDebug: true,
        shopApiPath: SHOP_API_PATH,
        shopApiPlayground: {
            settings: {
                'request.credentials': 'include',
            } as any,
        },
        shopApiDebug: true,
    },
    authOptions: {
        disableAuth: false,
        // tokenMethod: 'cookie',
        tokenMethod: 'bearer',
        requireVerification: true,
        customPermissions: [],
        authTokenHeaderKey: 'vendure-auth-token',
        sessionDuration: '1y',
    },
    dbConnectionOptions: {
        synchronize: false,
        logging: false,
        migrations: [path.join(__dirname, 'migrations/*.ts')],
        ...getDbConfig(),
    },
    paymentOptions: {
        paymentMethodEligibilityCheckers: [testPaymentChecker],
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    promotionOptions: {
        promotionActions: [...defaultPromotionActions, testPromoAction],
    },
    customFields: {
        /*Asset: [{ name: 'description', type: 'string' }],*/
        ProductVariant: [{ name: 'discountPrice', type: 'int' }],
        Channel: [{name: 'adresse', type: 'relation', entity: Address, graphQLType: 'Address', eager: false},
                {name: 'adressChannel', type: 'string'},
                {name: 'logo', type: 'relation', entity: Asset, graphQLType: 'Asset', eager: false}
    ],
        Customer: [{name: 'avatar', type: 'relation',graphQLType: 'Asset', entity: Asset, eager: false}]
    },
    logger: new DefaultLogger({ level: LogLevel.Info }),
    importExportOptions: {
        importAssetsDir: path.join(__dirname, 'import-assets'),
    },
    shippingOptions: {
        fulfillmentHandlers: [manualFulfillmentHandler, myHandler],
    },
    plugins: [
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, 'assets'),
        }),
        DefaultSearchPlugin,
        DefaultJobQueuePlugin,
        // ElasticsearchPlugin.init({
        //     host: 'http://localhost',
        //     port: 9200,
        // }),
        EmailPlugin.init({
            transport: {
                type: 'smtp',
                host: 'smtp.gmail.com',
                port: 465,
                logging: true,
                auth: {
                    user: `marino.oniriquefactory@gmail.com`,
                    pass: `568OUYtvf*`,
                },
                debug: true,
            },
            devMode: true,
            route: 'mailbox',
            handlers: defaultEmailHandlers,
            templatePath: path.join(__dirname, '../email-plugin/templates'),
            outputPath: path.join(__dirname, 'test-emails'),
            globalTemplateVars: {
                fromAddress: '"NeoFood" <no-reply@neofood.fr>',
                verifyEmailAddressUrl: 'http://localhost:4201/verify',
                passwordResetUrl: 'http://localhost:4201/reset-password',
                changeEmailAddressUrl: 'http://localhost:4201/change-email-address',
            },
            
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: 5001,
        }),
    ],
};

function getDbConfig(): ConnectionOptions {
    const dbType = process.env.DB || 'mysql';
    switch (dbType) {
        case 'postgres':
            console.log('Using postgres connection');
            return {
                synchronize: true,
                type: 'postgres',
                host: '127.0.0.1',
                port: 5432,
                username: 'admin',
                password: 'secret',
                database: 'vendure-dev',
            };
        case 'sqlite':
            console.log('Using sqlite connection');
            return {
                synchronize: false,
                type: 'better-sqlite3',
                database: path.join(__dirname, 'vendure.sqlite'),
            };
        case 'sqljs':
            console.log('Using sql.js connection');
            return {
                type: 'sqljs',
                autoSave: true,
                database: new Uint8Array([]),
                location: path.join(__dirname, 'vendure.sqlite'),
            };
        case 'mysql':
        default:
            console.log('Using mysql connection');
            return {
                synchronize: true,
                type: 'mariadb',
                host: '127.0.0.1',
                port: 3306,
                username: 'root',
                password: '',
                database: 'vendure-dev',
            };
    }
}
