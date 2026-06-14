import { KycService } from "./kyc.service";
export declare class KycController {
    private readonly service;
    constructor(service: KycService);
    step1(req: any, body: any): Promise<{
        success: boolean;
        step: number;
    }>;
    step2(req: any, body: any): Promise<{
        success: boolean;
        step: number;
    }>;
    step3(req: any, files: {
        idDocument?: Express.Multer.File[];
        selfieWithDocument?: Express.Multer.File[];
    }): Promise<{
        success: boolean;
        step: number;
    }>;
    submit(req: any, body: any): Promise<{
        success: boolean;
        status: string;
    }>;
    status(req: any): Promise<{
        status: string;
        completedSteps: never[];
        reviewNotes?: undefined;
        submittedAt?: undefined;
    } | {
        status: import(".prisma/client").$Enums.KYCStatus;
        completedSteps: (number | null)[];
        reviewNotes: string | null;
        submittedAt: Date;
    }>;
    resubmit(req: any): Promise<{
        success: boolean;
        status: string;
    }>;
}
//# sourceMappingURL=kyc.controller.d.ts.map