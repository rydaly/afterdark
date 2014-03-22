var possibleValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
var hash = window.location.hash;
if (hash.length) {
    hash = hash.substring(1);
    if (!possibleValues[hash]) {
        hash = 0;
    }
} else {
    hash = 0;
}
data = {
    0: {
        title: "Position",
        shapes: [{
            type: "rect",
            init: {
                attr: {
                    x: 50,
                    y: 75,
                    width: 50,
                    height: 50
                },
                style: {
                    stroke: "blue",
                    fill: "none"
                }
            },
            transition: {
                attr: {
                    x: 150
                }
            }
        }, {
            type: "circle",
            init: {
                attr: {
                    cx: 225,
                    cy: 75,
                    r: 25
                },
                style: {
                    stroke: "green",
                    fill: "none"
                }
            },
            transition: {
                attr: {
                    cy: 150
                }
            }
        }, {
            type: "path",
            init: {
                attr: {
                    d: "M 0,0 l 50,13 l -25,25 z",
                    transform: "translate(350,75)"
                },
                style: {
                    stroke: "red",
                    fill: "none"
                }
            },
            transition: {
                attr: {
                    transform: "translate(250,50)"
                }
            }
        }]
    },
    1: {
        title: "Sizes",
        shapes: [{
            type: "rect",
            init: {
                attr: {
                    x: 50,
                    y: 50,
                    width: 50,
                    height: 50
                },
                style: {
                    stroke: "blue",
                    fill: "none"
                }
            },
            transition: {
                attr: {
                    width: 100,
                    height: 100
                }
            }
        }, {
            type: "circle",
            init: {
                attr: {
                    cx: 225,
                    cy: 100,
                    r: 25
                },
                style: {
                    stroke: "green",
                    fill: "none"
                }
            },
            transition: {
                attr: {
                    r: 50
                }
            }
        }, {
            type: "path",
            init: {
                attr: {
                    d: "M 0,0 l 50,13 l -25,25 z",
                    transform: "translate(350,75)"
                },
                style: {
                    stroke: "red",
                    fill: "none"
                }
            },
            transition: {
                attr: {
                    d: "M 0,0 l 100,25 l -50,50 z"
                }
            }
        }]
    },
    2: {
        title: "Colors",
        shapes: [{
            type: "rect",
            init: {
                attr: {
                    x: 50,
                    y: 50,
                    width: 100,
                    height: 100
                },
                style: {
                    fill: "blue",
                    stroke: "blue"
                }
            },
            transition: {
                style: {
                    fill: "azure"
                }
            }
        }, {
            type: "circle",
            init: {
                attr: {
                    cx: 225,
                    cy: 100,
                    r: 50
                },
                style: {
                    fill: "green",
                    stroke: "green"
                }
            },
            transition: {
                style: {
                    fill: "darkorange"
                }
            }
        }, {
            type: "path",
            init: {
                attr: {
                    d: "M 0,0 l 100,25 l -50,50 z",
                    transform: "translate(350,75)"
                },
                style: {
                    fill: "red",
                    stroke: "red"
                }
            },
            transition: {
                style: {
                    fill: "hotpink"
                }
            }
        }]
    },
    3: {
        title: "Opacity",
        shapes: [{
            type: "rect",
            init: {
                attr: {
                    x: 140,
                    y: 60,
                    width: 220,
                    height: 120
                },
                style: {
                    fill: "blue",
                    opacity: 1
                }
            },
            transition: {
                style: {
                    opacity: 0
                }
            }
        }]
    },
    4: {
        title: "Simple movement",
        shapes: [{
            type: "rect",
            init: {
                attr: {
                    x: 40,
                    y: 80,
                    width: 60,
                    height: 60
                },
                style: {
                    stroke: "blue",
                    fill: "none"
                }
            },
            transition: {
                attr: {
                    x: 320
                }
            }
        }]
    },
    5: {
        title: "Duration and delay",
        shapes: [{
            type: "text",
            init: {
                attr: {
                    x: 20,
                    y: 80
                },
                style: {
                    fill: "blue",
                    stroke: "none"
                },
                text: "Duration: 250ms, no delay"
            },
            transition: {
                attr: {
                    x: 340
                },
                duration: 250
            }
        }, {
            type: "text",
            init: {
                attr: {
                    x: 20,
                    y: 120
                },
                style: {
                    fill: "red",
                    stroke: "none"
                },
                text: "Duration: 2s"
            },
            transition: {
                attr: {
                    x: 340
                },
                duration: 2000
            }
        }, {
            type: "text",
            init: {
                attr: {
                    x: 20,
                    y: 160
                },
                style: {
                    fill: "green",
                    stroke: "none"
                },
                text: "Duration: 1s, delay: 1s"
            },
            transition: {
                attr: {
                    x: 340
                },
                duration: 5000,
                delay: 1000
            }
        }]
    },
    6: {
        title: "Easing",
        shapes: [{
            type: "text",
            init: {
                attr: {
                    x: 20,
                    y: 80
                },
                style: {
                    fill: "blue",
                    stroke: "none"
                },
                text: "cubic-in-out (default)"
            },
            transition: {
                attr: {
                    x: 340
                },
                duration: 2000
            }
        }, {
            type: "text",
            init: {
                attr: {
                    x: 20,
                    y: 120
                },
                style: {
                    fill: "red",
                    stroke: "none"
                },
                text: "elastic"
            },
            transition: {
                attr: {
                    x: 340
                },
                duration: 2000,
                ease: "elastic"
            }
        }, {
            type: "text",
            init: {
                attr: {
                    x: 20,
                    y: 160
                },
                style: {
                    fill: "green",
                    stroke: "none"
                },
                text: "linear"
            },
            transition: {
                attr: {
                    x: 340
                },
                duration: 2000,
                ease: "linear"
            }
        }]
    },
    7: {
        title: "Transformation",
        shapes: [{
            type: "path",
            init: {
                attr: {
                    "d": "m 0,-60 l 20,40 l 40,20 l -40,20 l -20,40 l -20,-40 l -40,-20 l 40,-20 z",
                    "transform": "translate(250,120)"
                },
                style: {
                    stroke: "blue",
                    fill: "none"
                }
            },
            transition: {
                attr: {
                    "d": "m 0,-60 l 40,20 l 20,40 l -20,40 l -40,20 l -40,-20 l -20,-40 l 20,-40 z",
                }
            }
        }]
    },
    8: {
        title: "Transformation (line chart)",
        shapes: [{
            type: "path",
            init: {
                attr: {
                    "d": "m 0,120 L 20,110 L 40,170 L 60,190 L 80,180 L 100,160 L 120,165 L 140,140 L 160,120 L 180,130 L 200,150 L 220,130 L 240,120 L 260,110 L 280,90 L 300,80 L 320,85 L 340,100 L 360,90 L 380,80 L 400,70 L 420,50 L 440,45 L 460,50 L 500,40",
                },
                style: {
                    stroke: "blue",
                    "stroke-width": 2,
                    fill: "none"
                }
            },
            transition: {
                attr: {
                    "d": "m 0,120 L 20,105 L 40,100 L 60,95 L 80,100 L 100,105 L 120,100 L 140,90 L 160,85 L 180,80 L 200,60 L 220,70 L 240,80 L 260,100 L 280,110 L 300,150 L 320,130 L 340,125 L 360,120 L 380,130 L 400,140 L 420,170 L 440,150 L 460,160 L 500,180"
                }
            }
        }]
    },
    12: {
        title: "Line chart (no transition)",
        shapes: [{
            type: "path",
            init: {
                duration: 0.0001,
                attr: {
                    "d": "m 0,120 L 20,110 L 40,170 L 60,190 L 80,180 L 100,160 L 120,165 L 140,140 L 160,120 L 180,130 L 200,150 L 220,130 L 240,120 L 260,110 L 280,90 L 300,80 L 320,85 L 340,100 L 360,90 L 380,80 L 400,70 L 420,50 L 440,45 L 460,50 L 500,40",
                },
                style: {
                    stroke: "blue",
                    "stroke-width": 2,
                    fill: "none"
                }
            },
            transition: {
                duration: 0.0001,
                attr: {
                    "d": "m 0,120 L 20,105 L 40,100 L 60,95 L 80,100 L 100,105 L 120,100 L 140,90 L 160,85 L 180,80 L 200,60 L 220,70 L 240,80 L 260,100 L 280,110 L 300,150 L 320,130 L 340,125 L 360,120 L 380,130 L 400,140 L 420,170 L 440,150 L 460,160 L 500,180"
                }
            }
        }]
    },
    9: {
        title: "double transition",
        shapes: [{
            type: "rect",
            init: {
                attr: {
                    x: 0,
                    y: 40,
                    width: 20,
                    height: 20
                },
                style: {
                    fill: "blue",
                    stroke: "none"
                }
            },
            transition: {
                attr: {
                    x: 480
                },
                duration: 5000,
                next: {
                    attr: {
                        y: 180
                    },
                    duration: 5000,
                }
            }
        }]
    },
    10: {
        title: "Adding objects",
        shapes: [{
            type: "rect",
            init: {
                attr: {
                    x: 0,
                    y: 40,
                    width: 20,
                    height: 20
                },
                style: {
                    fill: "blue",
                    stroke: "none"
                }
            },
            transition: {
                attr: {
                    x: 480,
                    y: 80
                },
                next: {
                    type: "circle",
                    attr: {
                        cx: 490,
                        cy: 90,
                        r: 0
                    },
                    style: {
                        fill: "steelblue",
                        opacity: .5
                    },
                    next: {
                        style: {
                            opacity: 0
                        },
                        attr: {
                            r: 250
                        },
                        next: {
                            remove: true
                        }
                    }
                }
            }
        }]
    },
    11: {
        title: "All combined!",
        shapes: [{
            type: "path",
            init: {
                attr: {
                    "d": "m 0,-60 l 20,40 l 40,20 l -40,20 l -20,40 l -20,-40 l -40,-20 l 40,-20 z",
                    "transform": "translate(60,120)"
                },
                style: {
                    stroke: "blue",
                    fill: "white"
                }
            },
            transition: {
                attr: {
                    "d": "m 0,-60 l 40,20 l 20,40 l -20,40 l -40,20 l -40,-20 l -20,-40 l 20,-40 z",
                    "transform": "translate(440,120) rotate(180)"
                },
                style: {
                    stroke: "white",
                    fill: "blue"
                },
                next: {
                    type: "circle",
                    attr: {
                        cx: 440,
                        cy: 120,
                        r: 250
                    },
                    style: {
                        fill: "green",
                        opacity: 0
                    },
                    next: {
                        attr: {
                            r: 0
                        },
                        style: {
                            fill: "yellow",
                            opacity: 1
                        },
                        next: {
                            remove: true
                        }
                    }
                }
            }
        }]
    },
    13: {
        title: "Line chart (unrolling)",
        shapes: [{
                type: "path",
                init: {
                    attr: {
                        "d": "m0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120L0,120"
                    },
                    style: {
                        stroke: "blue",
                        "stroke-width": 2,
                        fill: "none"
                    }
                },
                transition: {
                    duration: 50,
                    delay: 50,
                    ease: "linear",
                    attr: {
                        "d": "m0,120L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110L20,110"
                    },
                    next: {
                        duration: 25,
                        ease: "linear",
                        attr: {
                            "d": "m0,120L20,110L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170L40,170"
                        },
                        next: {
                            duration: 25,
                            ease: "linear",
                            attr: {
                                "d": "m0,120L20,110L40,170L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190L60,190"
                            },
                            next: {
                                duration: 25,
                                ease: "linear",
                                attr: {
                                    "d": "m0,120L20,110L40,170L60,190L80,180L80,180L80,180L80,180L80,180L80,180L80,180L80,180L80,180L80,180L80,180L80,180L80,180L80,180L80,180L80,180L80,180L80,180L80,180L80,180L80,180L80,180"
                                },
                                next: {
                                    duration: 25,
                                    ease: "linear",
                                    attr: {
                                        "d": "m0,120L20,110L40,170L60,190L80,180L100,160L100,160L100,160L100,160L100,160L100,160L100,160L100,160L100,160L100,160L100,160L100,160L100,160L100,160L100,160L100,160L100,160L100,160L100,160L100,160L100,160"
                                    },
                                    next: {
                                        duration: 25,
                                        ease: "linear",
                                        attr: {
                                            "d": "m0,120L20,110L40,170L60,190L80,180L100,160L120,165L120,165L120,165L120,165L120,165L120,165L120,165L120,165L120,165L120,165L120,165L120,165L120,165L120,165L120,165L120,165L120,165L120,165L120,165L120,165"
                                        },
                                        next: {
                                            duration: 25,
                                            ease: "linear",
                                            attr: {
                                                "d": "m0,120L20,110L40,170L60,190L80,180L100,160L120,165L140,140L140,140L140,140L140,140L140,140L140,140L140,140L140,140L140,140L140,140L140,140L140,140L140,140L140,140L140,140L140,140L140,140L140,140L140,140"
                                            },
                                            next: {
                                                duration: 25,
                                                ease: "linear",
                                                attr: {
                                                    "d": "m0,120L20,110L40,170L60,190L80,180L100,160L120,165L140,140L160,120L160,120L160,120L160,120L160,120L160,120L160,120L160,120L160,120L160,120L160,120L160,120L160,120L160,120L160,120L160,120L160,120L160,120"
                                                },
                                                next: {
                                                    duration: 25,
                                                    ease: "linear",
                                                    attr: {
                                                        "d": "m0,120L20,110L40,170L60,190L80,180L100,160L120,165L140,140L160,120L180,130L180,130L180,130L180,130L180,130L180,130L180,130L180,130L180,130L180,130L180,130L180,130L180,130L180,130L180,130L180,130L180,130"
                                                    },
                                                    next: {
                                                        duration: 25,
                                                        ease: "linear",
                                                        attr: {
                                                            "d": "m0,120L20,110L40,170L60,190L80,180L100,160L120,165L140,140L160,120L180,130L200,150L200,150L200,150L200,150L200,150L200,150L200,150L200,150L200,150L200,150L200,150L200,150L200,150L200,150L200,150L200,150"
                                                        },
                                                        next: {
                                                            duration: 25,
                                                            ease: "linear",
                                                            attr: {
                                                                "d": "m0,120L20,110L40,170L60,190L80,180L100,160L120,165L140,140L160,120L180,130L200,150L220,130L220,130L220,130L220,130L220,130L220,130L220,130L220,130L220,130L220,130L220,130L220,130L220,130L220,130L220,130"
                                                            },
                                                            next: {
                                                                duration: 25,
                                                                ease: "linear",
                                                                attr: {
                                                                    "d": "m0,120L20,110L40,170L60,190L80,180L100,160L120,165L140,140L160,120L180,130L200,150L220,130L240,120L240,120L240,120L240,120L240,120L240,120L240,120L240,120L240,120L240,120L240,120L240,120L240,120L240,120"
                                                                },
                                                                next: {
                                                                    duration: 25,
                                                                    ease: "linear",
                                                                    attr: {
                                                                        "d": "m0,120L20,110L40,170L60,190L80,180L100,160L120,165L140,140L160,120L180,130L200,150L220,130L240,120L260,110L260,110L260,110L260,110L260,110L260,110L260,110L260,110L260,110L260,110L260,110L260,110L260,110"
                                                                    },
                                                                    next: {
                                                                        duration: 25,
                                                                        ease: "linear",
                                                                        attr: {
                                                                            "d": "m0,120L20,110L40,170L60,190L80,180L100,160L120,165L140,140L160,120L180,130L200,150L220,130L240,120L260,110L280,90L280,90L280,90L280,90L280,90L280,90L280,90L280,90L280,90L280,90L280,90L280,90"
                                                                        },
                                                                        next: {
                                                                            duration: 25,
                                                                            ease: "linear",
                                                                            attr: {
                                                                                "d": "m0,120L20,110L40,170L60,190L80,180L100,160L120,165L140,140L160,120L180,130L200,150L220,130L240,120L260,110L280,90L300,80L300,80L300,80L300,80L300,80L300,80L300,80L300,80L300,80L300,80L300,80"
                                                                            },
                                                                            next: {
                                                                                duration: 25,
                                                                                ease: "linear",
                                                                                attr: {
                                                                                    "d": "m0,120L20,110L40,170L60,190L80,180L100,160L120,165L140,140L160,120L180,130L200,150L220,130L240,120L260,110L280,90L300,80L320,85L320,85L320,85L320,85L320,85L320,85L320,85L320,85L320,85L320,85"
                                                                                },
                                                                                next: {
                                                                                    duration: 25,
                                                                                    ease: "linear",
                                                                                    attr: {
                                                                                        "d": "m0,120L20,110L40,170L60,190L80,180L100,160L120,165L140,140L160,120L180,130L200,150L220,130L240,120L260,110L280,90L300,80L320,85L340,100L340,100L340,100L340,100L340,100L340,100L340,100L340,100L340,100"
                                                                                    },
                                                                                    next: {
                                                                                        duration: 25,
                                                                                        ease: "linear",
                                                                                        attr: {
                                                                                            "d": "m0,120L20,110L40,170L60,190L80,180L100,160L120,165L140,140L160,120L180,130L200,150L220,130L240,120L260,110L280,90L300,80L320,85L340,100L360,90L360,90L360,90L360,90L360,90L360,90L360,90L360,90"
                                                                                        },
                                                                                        next: {
                                                                                            du…