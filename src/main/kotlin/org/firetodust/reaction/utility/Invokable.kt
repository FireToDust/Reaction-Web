package org.firetodust.reaction.utility

interface Invokable<Self: Invokable<Self>>{
    @Suppress("UNCHECKED_CAST")
    operator fun invoke(block: Self.() -> Unit): Self {
        (this as Self).block()
        return this
    }
}