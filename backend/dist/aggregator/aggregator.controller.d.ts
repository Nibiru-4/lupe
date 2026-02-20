import { AggregatorService } from './aggregator.service';
export declare class AggregatorController {
    private readonly aggregatorService;
    constructor(aggregatorService: AggregatorService);
    triggerAggregation(): Promise<{
        ok: boolean;
        reason?: string;
    }>;
}
