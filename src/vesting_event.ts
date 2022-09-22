import {near, BigInt, log, JSONValue, json, Bytes, store} from "@graphprotocol/graph-ts";
import { JSON } from "assemblyscript-json";
import {vestingFromJSON} from "./types";
import {Vesting} from "../generated/schema";

export function handleVestingEvent(event: string, data: JSON.Obj): void {
    log.info("start handleVestingEvent",[]);

    if(event=="create_vesting") {
        handleCreateVesting(data.getObj("vesting")!, data.getString("token_id")!.valueOf());
    } else if (event=="update_vesting") {
        handleUpdateVesting(data.getObj("vesting")!);
    } else if (event=="terminate_vesting") {
        handleTerminateVesting(data);
    } else if (event=="finish_vesting") {
        handleFinishVesting(data);
    }

    log.info("end handleVestingEvent",[]);
}


function handleCreateVesting(data: JSON.Obj, token_id: string):void {
    log.info("start handleCreateVesting",[]);

    let vesting_entity = vestingFromJSON(data, token_id);
    vesting_entity.save();
    log.info("end handleCreateVesting",[]);
}

function handleUpdateVesting(data: JSON.Obj):void {
    log.info("start handleUpdateVesting",[]);
    let vesting_entity = vestingFromJSON(data, null);
    vesting_entity.save();
    log.info("end handleUpdateVesting",[]);
}

function handleTerminateVesting(data: JSON.Obj):void {
    log.info("start handleTerminateVesting",[]);
    let vesting_id = data.getString("vesting_id")!.valueOf();
    let vesting = Vesting.load(vesting_id)!;
    vesting.is_terminated = true;
    vesting.save();
    log.info("end handleTerminateVesting",[]);
}


function handleFinishVesting(data: JSON.Obj):void {
    log.info("start handleFinishVesting,data: {}",[data.toString()]);
    let vesting_id = data.getString("vesting_id")!.valueOf();
    let vesting = Vesting.load(vesting_id)!;
    vesting.is_finish = true;
    vesting.save();
    log.info("vesting.is_finish: {}", [vesting.is_finish.toString()])
    log.info("end handleFinishVesting",[]);
}
