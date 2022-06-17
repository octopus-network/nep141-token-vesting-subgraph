import {near, BigInt, log, JSONValue, json, Bytes, store} from "@graphprotocol/graph-ts";
import { JSON } from "assemblyscript-json";
import {VestingEntity, vestingFromJSON} from "./types";
import {Vesting} from "../generated/schema";

export function handleVestingEvent(event: string, data: JSON.Obj): void {
    log.info("start handleVestingEvent",[]);

    if(event=="create_vesting") {
        handleCreateVesting(data.getObj("vesting")!);
    } else if (event=="update_vesting") {
        handleUpdateVesting(data.getObj("vesting")!);
    } else if (event=="terminate_vesting") {
        handleTerminateVesting(data);
    }

    log.info("end handleVestingEvent",[]);
}


function handleCreateVesting(data: JSON.Obj):void {
    log.info("start handleCreateVesting",[]);

    let vesting_entity = vestingFromJSON(data);
    vesting_entity.save();
    log.info("end handleCreateVesting",[]);
}

function handleUpdateVesting(data: JSON.Obj):void {
    log.info("start handleUpdateVesting",[]);
    let vesting_entity = vestingFromJSON(data);
    vesting_entity.save();
    log.info("end handleUpdateVesting",[]);
}

function handleTerminateVesting(data: JSON.Obj):void {
    log.info("start handleTerminateVesting",[]);
    let vesting_id = data.getObj("data")!.getString("vesting_id")!.valueOf();
    let vesting = Vesting.load(vesting_id)!;
    vesting.is_terminated = true;
    vesting.save();
    log.info("end handleTerminateVesting",[]);
}
