# OCTO_effects_extensionsA list of 'special effect' extensions for the Vuforia Studio platform

These include
* visual appearance extensions (reflective, translucent)
* visualisation techniques (see inside, simulated flow)

## Installation

Download the entire folder structure and unpack into the Vuforia/Studio installation/Extensions
directory.  Stop and restart Studio. The extensions widgets will now appear in the various control pallete locations.
 
## Details

### Directional Flow
A simple effect that will flow a specified image over a 3d model. The author can
choose the direction and speed, and can control the intensity of the effect.

The model parts (modelitems) to be affected must first be processed to include texture mapping coordinates (u,v) that represent the characteristics of the data
that is to 'flow'.  An example might be showing a fluid moving along a pipe, or electrical current moving along a cable.  This is not a true-to-life physical simulation, but a simple visualization technique
for presenting flow velocity (direction,speed).  Importantly, the widget does NOT provide or aid with the texture mapping process. That must be done in a CAD or DCC editor.  Simulation tools may also provide suitable model data.

The widget uses this mapping to then visualise the flow.  

### See Inside
This widget will control the effect of showing selected parts (model items) that are located within some physical or virtual object.

### See Reflection
This widget will apply a reflection effect to specified model parts.

### See Through
This widget will apply a transparency effect similar to glass; slightly reflective (based on incedence angle) but also transparent.
