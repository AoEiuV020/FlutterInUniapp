@file:Suppress("UNCHECKED_CAST", "USELESS_CAST", "INAPPLICABLE_JVM_NAME", "UNUSED_ANONYMOUS_PARAMETER")
package uts.sdk.modules.aoFlutter;
import com.taobao.weex.annotation.JSMethod;
import flutter.FlutterFrameLayout;
import io.dcloud.feature.uniapp.UniSDKInstance;
import io.dcloud.feature.uniapp.ui.action.AbsComponentData;
import io.dcloud.feature.uniapp.ui.component.AbsVContainer;
import io.dcloud.uniapp.*;
import io.dcloud.uniapp.extapi.*;
import io.dcloud.uts.*;
import io.dcloud.uts.Map;
import io.dcloud.uts.Set;
import io.dcloud.uts.UTSAndroid;
import io.dcloud.uts.component.*;
import io.dcloud.uts.component.UTSComponent;
import kotlinx.coroutines.CoroutineScope;
import kotlinx.coroutines.Deferred;
import kotlinx.coroutines.Dispatchers;
import kotlinx.coroutines.async;
open class AoFlutterComponent : UTSComponent<FlutterFrameLayout> {
    constructor(instance: UniSDKInstance?, parent: AbsVContainer<*>?, componentData: AbsComponentData<*>?) : super(instance, parent, componentData) ;
    override fun created() {
        console.log("ao-flutter: created生命周期");
    }
    override fun NVBeforeLoad() {
        console.log("ao-flutter: NVBeforeLoad生命周期");
    }
    override fun NVLoad(): FlutterFrameLayout {
        console.log("ao-flutter: NVLoad生命周期");
        val flutterView = FlutterFrameLayout(`$androidContext`!!);
        this.`$emit`("viewready");
        return flutterView;
    }
    override fun NVLoaded() {
        console.log("ao-flutter: NVLoaded生命周期");
    }
    override fun NVLayouted() {
        console.log("ao-flutter: NVLayouted生命周期");
    }
    override fun NVBeforeUnload() {
        console.log("ao-flutter: NVBeforeUnload生命周期");
    }
    override fun NVUnloaded() {
        console.log("ao-flutter: NVUnloaded生命周期");
    }
    override fun unmounted() {
        console.log("ao-flutter: unmounted生命周期");
    }
    @JSMethod(uiThread = false)
    open fun start() {
        console.log("ao-flutter: start方法被调用");
    }
}
