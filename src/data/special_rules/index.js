import adrenalizer from "./adrenalizer.json";
import advanced_optics from "./advanced_optics.json";
import aegis_field from "./aegis_field.json";
import anathema_drive from "./anathema_drive.json";
import apotropaic_reactor from "./apotropaic_reactor.json";
import arcane_parasite from "./arcane_parasite.json";
import arcantrik_amplifier from "./arcantrik_amplifier.json";
import arcantrik_turbine from "./arcantrik_turbine.json";
import arc_amplifier from "./arc_amplifier.json";
import arc_booster from "./arc_booster.json";
import arc_disruptor from "./arc_disruptor.json";
import arc_exchange from "./arc_exchange.json";
import arc_relay from "./arc_relay.json";
import armor_piercing from "./armor_piercing.json";
import battle_commander from "./battle_commander.json";
import blast from "./blast.json";
import blast_shielding from "./blast_shielding.json";
import cadre from "./cadre.json";
import carrion_ablator from "./carrion_ablator.json";
import cleave from "./cleave.json";
import command_interface from "./command_interface.json";
import compound_armor from "./compound_armor.json";
import corrosion from "./corrosion.json";
import defense_matrix from "./defense_matrix.json";
import eruption from "./eruption.json";
import field_reinforcement from "./field_reinforcement.json";
import fire from "./fire.json";
import flight from "./flight.json";
import force_field from "./force_field.json";
import force_projector from "./force_projector.json";
import force_ram from "./force_ram.json";
import gorge from "./gorge.json";
import heightened_reflexes from "./heightened_reflexes.json";
import high_intensity from "./high_intensity.json";
import hunter_killer_rounds from "./hunter_killer_rounds.json";
import impulse_reactor from "./impulse_reactor.json";
import incorporeal from "./incorporeal.json";
import inhabiting_spirit from "./inhabiting_spirit.json";
import intercept_driver from "./intercept_driver.json";
import jack_hunter from "./jack_hunter.json";
import kinetic_field from "./kinetic_field.json";
import living_terror from "./living_terror.json";
import lock_down from "./lock_down.json";
import mantlet from "./mantlet.json";
import mechanikal_optics from "./mechanikal_optics.json";
import mimetic_cloak from "./mimetic_cloak.json";
import neural_net from "./neural_net.json";
import neural_web from "./neural_web.json";
import nullifier from "./nullifier.json";
import null_strike from "./null_strike.json";
import pathfinder from "./pathfinder.json";
import phase_sequencer from "./phase_sequencer.json";
import phase_sequencer_squad from "./phase_sequencer_squad.json";
import phase_stalker from "./phase_stalker.json";
import phase_strike from "./phase_strike.json";
import phase_trajectile from "./phase_trajectile.json";
import power_attack from "./power_attack.json";
import psychoclasm from "./psychoclasm.json";
import psycho_disruptor from "./psycho_disruptor.json";
import psycho_relay from "./psycho_relay.json";
import rapid_strike from "./rapid_strike.json";
import reflex_accelerator from "./reflex_accelerator.json";
import refractor_field from "./refractor_field.json";
import repair from "./repair.json";
import repulsor from "./repulsor.json";
import repulsor_ram from "./repulsor_ram.json";
import reserve_power_cells from "./reserve_power_cells.json";
import resurrection_protocol from "./resurrection_protocol.json";
import revelator from "./revelator.json";
import rites_of_sorrow from "./rites_of_sorrow.json";
import scything_run from "./scything_run.json";
import shadow_phaser from "./shadow_phaser.json";
import shield from "./shield.json";
import sidestep from "./sidestep.json";
import singularity_collapse from "./singularity_collapse.json";
import siphon_power from "./siphon_power.json";
import slip_displacer from "./slip_displacer.json";
import smart_lock from "./smart_lock.json";
import spotlight from "./spotlight.json";
import spray from "./spray.json";
import stealth from "./stealth.json";
import strafe from "./strafe.json";
import targeter from "./targeter.json";
import temporal_anomaly from "./temporal_anomaly.json";
import thanotech_reclaimer from "./thanotech_reclaimer.json";
import void_gate from "./void_gate.json";
import void_gazer from "./void_gazer.json";
import void_spiral from "./void_spiral.json";
import walking_arsenal from "./walking_arsenal.json";
import weapon_expert from "./weapon_expert.json";
import wide_spectrum_scanners from "./wide_spectrum_scanners.json";

const special_rulesData = {
	adrenalizer: adrenalizer,
	advanced_optics: advanced_optics,
	aegis_field: aegis_field,
	anathema_drive: anathema_drive,
	apotropaic_reactor: apotropaic_reactor,
	arcane_parasite: arcane_parasite,
	arcantrik_amplifier: arcantrik_amplifier,
	arcantrik_turbine: arcantrik_turbine,
	arc_amplifier: arc_amplifier,
	arc_booster: arc_booster,
	arc_disruptor: arc_disruptor,
	arc_exchange: arc_exchange,
	arc_relay: arc_relay,
	armor_piercing: armor_piercing,
	battle_commander: battle_commander,
	blast: blast,
	blast_shielding: blast_shielding,
	cadre: cadre,
	carrion_ablator: carrion_ablator,
	cleave: cleave,
	command_interface: command_interface,
	compound_armor: compound_armor,
	corrosion: corrosion,
	defense_matrix: defense_matrix,
	eruption: eruption,
	field_reinforcement: field_reinforcement,
	fire: fire,
	flight: flight,
	force_field: force_field,
	force_projector: force_projector,
	force_ram: force_ram,
	gorge: gorge,
	heightened_reflexes: heightened_reflexes,
	high_intensity: high_intensity,
	hunter_killer_rounds: hunter_killer_rounds,
	impulse_reactor: impulse_reactor,
	incorporeal: incorporeal,
	inhabiting_spirit: inhabiting_spirit,
	intercept_driver: intercept_driver,
	jack_hunter: jack_hunter,
	kinetic_field: kinetic_field,
	living_terror: living_terror,
	lock_down: lock_down,
	mantlet: mantlet,
	mechanikal_optics: mechanikal_optics,
	mimetic_cloak: mimetic_cloak,
	neural_net: neural_net,
	neural_web: neural_web,
	nullifier: nullifier,
	null_strike: null_strike,
	pathfinder: pathfinder,
	phase_sequencer: phase_sequencer,
	phase_sequencer_squad: phase_sequencer_squad,
	phase_stalker: phase_stalker,
	phase_strike: phase_strike,
	phase_trajectile: phase_trajectile,
	power_attack: power_attack,
	psychoclasm: psychoclasm,
	psycho_disruptor: psycho_disruptor,
	psycho_relay: psycho_relay,
	rapid_strike: rapid_strike,
	reflex_accelerator: reflex_accelerator,
	refractor_field: refractor_field,
	repair: repair,
	repulsor: repulsor,
	repulsor_ram: repulsor_ram,
	reserve_power_cells: reserve_power_cells,
	resurrection_protocol: resurrection_protocol,
	revelator: revelator,
	rites_of_sorrow: rites_of_sorrow,
	scything_run: scything_run,
	shadow_phaser: shadow_phaser,
	shield: shield,
	sidestep: sidestep,
	singularity_collapse: singularity_collapse,
	siphon_power: siphon_power,
	slip_displacer: slip_displacer,
	smart_lock: smart_lock,
	spotlight: spotlight,
	spray: spray,
	stealth: stealth,
	strafe: strafe,
	targeter: targeter,
	temporal_anomaly: temporal_anomaly,
	thanotech_reclaimer: thanotech_reclaimer,
	void_gate: void_gate,
	void_gazer: void_gazer,
	void_spiral: void_spiral,
	walking_arsenal: walking_arsenal,
	weapon_expert: weapon_expert,
	wide_spectrum_scanners: wide_spectrum_scanners
}
export default special_rulesData