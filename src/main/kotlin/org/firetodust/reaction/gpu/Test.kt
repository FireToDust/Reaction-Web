package org.firetodust.reaction.gpu

import org.firetodust.reaction.gpu.pipeline.builder.Path
import org.firetodust.reaction.gpu.pipeline.builder.PipelineBuilder

val builder = PipelineBuilder()

fun test(){
    builder{
        has(Path("Physics"))
    }
}